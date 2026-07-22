import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

interface KpiInterpretationParams {
  kpiCode: string;
  kpiName: string;
  value: number;
  target: number;
  direction: 'up' | 'down';
  unit: string;
  status: 'good' | 'warning' | 'bad' | 'neutral';
  previousValue?: number;
  timeSeries?: { date: string; value: number }[];
  month?: string;
}

interface ChartInterpretationParams {
  chartType: 'donut' | 'bar' | 'trend';
  title: string;
  data: any;
  month?: string;
}

interface CacheEntry {
  text: string;
  expiry: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 60 * 60 * 1000;
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly MODEL = 'llama-3.3-70b-versatile';

  private getApiKey(): string | null {
    return process.env.GROQ_API_KEY?.trim() || null;
  }

  private getCacheKey(type: string, code: string, month?: string): string {
    return `${type}-${code}-${month || 'default'}`;
  }

  private getFromCache(key: string): string | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() < entry.expiry) {
      return entry.text;
    }
    if (entry) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCache(key: string, text: string): void {
    this.cache.set(key, {
      text,
      expiry: Date.now() + this.CACHE_TTL,
    });
  }

  private async callGroq(systemPrompt: string, userPrompt: string): Promise<string | null> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      this.logger.warn('GROQ_API_KEY no configurada');
      return null;
    }

    try {
      const response = await axios.post(
        this.GROQ_API_URL,
        {
          model: this.MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        },
      );

      return response.data.choices?.[0]?.message?.content?.trim() || null;
    } catch (error: any) {
      if (error?.response?.status === 429) {
        this.logger.warn('GROQ rate limit alcanzado');
      } else {
        this.logger.error(`Error llamando GROQ: ${error?.message}`);
      }
      return null;
    }
  }

  async interpretKpi(params: KpiInterpretationParams): Promise<{ text: string } | null> {
    const cacheKey = this.getCacheKey('kpi', params.kpiCode, params.month);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return { text: cached };
    }

    const statusMap = {
      good: 'Óptimo',
      warning: 'En Alerta',
      bad: 'Crítico',
      neutral: 'Sin Meta',
    };

    const directionLabel = params.direction === 'up' ? 'mayor es mejor' : 'menor es mejor';

    let trendText = 'Sin datos de tendencia';
    if (params.previousValue && params.previousValue !== 0) {
      const trendPct = ((params.value - params.previousValue) / params.previousValue) * 100;
      const trendSign = trendPct >= 0 ? '+' : '';
      trendText = `${trendSign}${trendPct.toFixed(1)}% vs mes anterior`;
    }

    let historyText = 'Sin histórico reciente';
    if (params.timeSeries && params.timeSeries.length > 0) {
      const last4 = params.timeSeries.slice(-4);
      historyText = last4.map((d) => `${d.date}: ${d.value.toFixed(1)}`).join(', ');
    }

    const systemPrompt = `Eres un analista logístico experto de SCILIP (Sistema de Control de Indicadores Logísticos). 
Interpreta indicadores de forma semi-formal, clara y accionable en español.
Responde en máximo 3 oraciones cortas: qué indica el valor, qué tan bien/mal está vs la meta, y una recomendación concreta.
Solo texto plano, sin formato markdown, sin listas, sin negritas.`;

    const userPrompt = `INDICADOR: ${params.kpiName} (${params.kpiCode})
Valor actual: ${params.value.toFixed(2)} ${params.unit}
Meta: ${params.target.toFixed(2)}
Dirección: ${directionLabel}
Estado: ${statusMap[params.status]}
Tendencia: ${trendText}
Histórico reciente: ${historyText}

Interpreta este indicador logístico.`;

    const result = await this.callGroq(systemPrompt, userPrompt);
    if (result) {
      this.setCache(cacheKey, result);
      return { text: result };
    }
    return null;
  }

  async interpretChart(params: ChartInterpretationParams): Promise<{ text: string } | null> {
    const cacheKey = this.getCacheKey('chart', `${params.chartType}-${params.title}`, params.month);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return { text: cached };
    }

    const chartTypeLabels: Record<string, string> = {
      donut: 'gráfico de dona (resumen de estados)',
      bar: 'gráfico de barras (cumplimiento por categoría)',
      trend: 'gráfico de tendencia (evolución mensual)',
    };

    const chartLabel = chartTypeLabels[params.chartType] || params.chartType;

    let dataDescription = '';
    if (params.chartType === 'donut' && params.data) {
      dataDescription = `Óptimos: ${params.data.good || 0}, En Alerta: ${params.data.warning || 0}, Críticos: ${params.data.bad || 0}, Sin Meta: ${params.data.neutral || 0}`;
    } else if (params.chartType === 'bar' && Array.isArray(params.data)) {
      dataDescription = params.data
        .map((c: any) => `${c.name}: ${c.compliance?.toFixed(1)}% cumplimiento (${c.good} óptimos, ${c.warning} alerta, ${c.bad} críticos)`)
        .join('\n');
    } else if (params.chartType === 'trend' && Array.isArray(params.data)) {
      dataDescription = params.data
        .slice(-6)
        .map((d: any) => `${d.date}: ${d.value?.toFixed(1)}`)
        .join(', ');
    } else {
      dataDescription = JSON.stringify(params.data).substring(0, 500);
    }

    const systemPrompt = `Eres un analista logístico experto de SCILIP (Sistema de Control de Indicadores Logísticos).
Interpreta gráficas y datos agregados de forma semi-formal, clara y accionable en español.
Responde en máximo 3 oraciones cortas: qué muestra la gráfica, cuál es la tendencia o patrón principal, y una recomendación.
Solo texto plano, sin formato markdown, sin listas, sin negritas.`;

    const userPrompt = `GRÁFICA: ${params.title} (${chartLabel})
DATOS:
${dataDescription}

Interpreta esta gráfica del dashboard logístico.`;

    const result = await this.callGroq(systemPrompt, userPrompt);
    if (result) {
      this.setCache(cacheKey, result);
      return { text: result };
    }
    return null;
  }
}
