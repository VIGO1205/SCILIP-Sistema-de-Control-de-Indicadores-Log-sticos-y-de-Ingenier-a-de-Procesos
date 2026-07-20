"use client";

import React from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<h2 className="text-3xl font-bold text-gray-900">Recuperar acceso</h2>
				<p className="mt-2 text-sm text-gray-600">
					Te enviaremos un enlace para restablecer tu contraseña.
				</p>
			</div>

			<form className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
						placeholder="admin@ejemplo.com"
					/>
				</div>

				<button
					type="button"
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				>
					Enviar enlace
				</button>
			</form>

			<div className="text-center text-sm">
				<Link href="/login" className="text-blue-600 hover:text-blue-500">
					Volver a iniciar sesión
				</Link>
			</div>
		</div>
	);
}
