import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

export default function SetupPage() {
    // Essa função roda no Servidor (segurança máxima para a senha)
    async function createAccount(formData: FormData) {
        'use server';

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const role = formData.get('role') as string;

        // Criptografa a senha antes de mandar pro backend
        const hashedPassword = await bcrypt.hash(password, 10);

        // Envia para o seu backend Express
        const res = await fetch('http://localhost:3001/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password: hashedPassword,
                role,
            }),
        });

        if (res.ok) {
            redirect('/login'); // Se der certo, joga pra tela de login que vamos criar
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md">
                <h1 className="text-2xl font-black text-slate-800 mb-2">
                    System Setup 🛠️
                </h1>
                <p className="text-slate-500 text-sm mb-6">
                    Create the first Admin/Chef account.
                </p>

                <form action={createAccount} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Full Name
                        </label>
                        <input
                            name="name"
                            required
                            placeholder="Ex: Gordon Ramsay"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="chef@restaurant.com"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            Role
                        </label>
                        <select
                            name="role"
                            className="w-full p-3 border border-slate-300 rounded-lg outline-none bg-white"
                        >
                            <option value="CHEF">Head Chef</option>
                            <option value="MANAGER">Manager</option>
                            <option value="STAFF">Kitchen Staff</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-lg transition-colors"
                    >
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
}
