import Link from 'next/link';
import { CheckCircle2, Users, Building2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-100 px-4 sm:px-6 h-14 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center">
          <img src="/logo.png" alt="ChambaLatinApp" className="h-8 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-50"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            MVP · En desarrollo
          </span>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            Empleos directos,
            <br />
            <span className="text-blue-700">sin complicaciones</span>
          </h1>

          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Conectamos empresas con candidatos de forma ágil. Sin subir CVs en PDF,
            sin formularios interminables. Solo lo que importa.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Users className="w-4 h-4" />
              Soy Candidato
            </Link>
            <Link
              href="/register?rol=empresa"
              className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-medium px-6 py-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Soy Empresa
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left w-full">
          {[
            {
              icon: CheckCircle2,
              color: 'text-green-600',
              title: 'Sin documentos',
              desc: 'Nada de CVs en PDF ni fotos. El perfil del candidato es su aplicación.',
            },
            {
              icon: Building2,
              color: 'text-blue-600',
              title: 'Empresas verificadas',
              desc: 'Solo publican empresas aprobadas manualmente por el administrador.',
            },
            {
              icon: Users,
              color: 'text-purple-600',
              title: 'Perfiles enfocados',
              desc: 'Candidatos con datos concretos: disponibilidad, vehículo, turno preferido.',
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="flex gap-3">
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
              <div>
                <p className="font-semibold text-slate-900 text-sm">{title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        ChambaLatinApp © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
