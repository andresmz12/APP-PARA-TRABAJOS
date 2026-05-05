import Link from 'next/link';
import { Users, Building2, MapPin, Clock, TrendingUp, CheckCircle2, HardHat, ChefHat, Truck, Wrench, Shield } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="flex items-center gap-2">
            <Link href="/login"
              className="text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register"
              className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
              Registrarse gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white">
        {/* decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-500/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-5">
            Empleos reales para la
            <br />
            <span className="text-brand-500">comunidad latina</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            ChambaLatinApp conecta trabajadores hispanos con empleadores locales en EE.UU.
            Sin papeleos complicados. Sin CV en PDF. Solo tú y tu próxima oportunidad.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base shadow-lg shadow-brand-500/30">
              <Users className="w-5 h-5" />
              Soy candidato — busco chamba
            </Link>
            <Link href="/register?rol=empresa"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base">
              <Building2 className="w-5 h-5" />
              Soy empresa — quiero contratar
            </Link>
          </div>

          {/* social proof subtle */}
          <p className="mt-8 text-sm text-slate-400">
            Completamente gratis para candidatos · Empresas verificadas manualmente
          </p>
        </div>
      </section>

      {/* ── En construcción notice ── */}
      <section className="bg-brand-50 border-y border-brand-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="text-2xl">🚧</span>
          <div className="flex-1">
            <p className="font-semibold text-brand-700 text-sm">
              Estamos apenas comenzando — y eso es emocionante.
            </p>
            <p className="text-brand-600 text-sm mt-0.5">
              Por ahora tenemos pocos empleos disponibles, pero cada semana sumamos nuevas empresas y ciudades.
              Si te registras hoy, serás de los primeros en ver cada nueva vacante.
            </p>
          </div>
          <Link href="/register"
            className="shrink-0 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
            Entrar antes que todos
          </Link>
        </div>
      </section>

      {/* ── Qué es ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Qué es ChambaLatinApp?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Una plataforma pensada desde cero para trabajadores latinos en Estados Unidos.
              Sin barreras de idioma. Sin burocracia. Directa al trabajo.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                color: 'bg-blue-50 text-blue-600',
                title: 'Para trabajadores',
                desc: 'Crea tu perfil en minutos. Describe tu experiencia con tus propias palabras, sin necesidad de CV. Las empresas te encuentran a ti.',
              },
              {
                icon: Building2,
                color: 'bg-brand-50 text-brand-600',
                title: 'Para empleadores',
                desc: 'Publica vacantes y accede a candidatos reales en tu ciudad. Cada empresa pasa por verificación manual antes de poder contratar.',
              },
              {
                icon: CheckCircle2,
                color: 'bg-green-50 text-green-600',
                title: 'Sin complicaciones',
                desc: 'Nada de cuentas de pago, tarifas ocultas ni procesos lentos. Conexión directa entre empresa y candidato desde el primer día.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-7 flex flex-col gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industrias ── */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Áreas de trabajo</h2>
          <p className="text-slate-500 mb-12">Empleos en los sectores donde más trabajamos los latinos.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { icon: HardHat,  label: 'Construcción' },
              { icon: ChefHat,  label: 'Cocina' },
              { icon: Truck,    label: 'Logística' },
              { icon: Wrench,   label: 'Manufactura' },
              { icon: Shield,   label: 'Seguridad' },
              { icon: Users,    label: 'Limpieza' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3 shadow-sm border border-slate-100 hover:border-brand-300 hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-navy-900 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-brand-500" />
                </div>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-slate-500">Tres pasos. Sin complicaciones.</p>
          </div>

          <div className="flex flex-col gap-6">
            {[
              {
                step: '01',
                title: 'Crea tu perfil',
                desc: 'Regístrate gratis y completa tu perfil en minutos: experiencia, habilidades, disponibilidad y ciudad. Sin CV, sin fotos.',
                detail: 'Candidato',
              },
              {
                step: '02',
                title: 'Explora las vacantes',
                desc: 'Ve los empleos disponibles en tu área. Filtra por industria, horario o modalidad. Aplica con un solo clic.',
                detail: 'Candidato',
              },
              {
                step: '03',
                title: 'La empresa te contacta',
                desc: 'Si tu perfil encaja, la empresa se comunica directamente contigo. Sin intermediarios ni esperas largas.',
                detail: 'Empresa + Candidato',
              },
            ].map(({ step, title, desc, detail }) => (
              <div key={step} className="flex gap-5 items-start">
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-navy-900 flex items-center justify-center">
                  <span className="text-brand-500 font-extrabold text-lg">{step}</span>
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{title}</h3>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{detail}</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Creciendo ── */}
      <section className="bg-navy-900 text-white py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <TrendingUp className="w-10 h-10 text-brand-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-5">
            Pequeños hoy,<br />
            <span className="text-brand-500">grandes mañana</span>
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-4 leading-relaxed">
            ChambaLatinApp está en sus primeros pasos. Ahorita mismo tenemos pocas vacantes,
            pero estamos sumando empresas y ciudades semana a semana.
          </p>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10">
            Si te registras hoy, serás parte de la comunidad fundadora. Las primeras personas
            que confíen en nosotros serán las primeras en beneficiarse cuando crezcamos.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-10">
            {[
              { icon: MapPin,  label: 'Expandiendo ciudades' },
              { icon: Clock,   label: 'Nuevas vacantes cada semana' },
              { icon: Users,   label: 'Comunidad creciendo' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 bg-white/5 rounded-xl px-4 py-5 border border-white/10">
                <Icon className="w-5 h-5 text-brand-500" />
                <span className="text-sm text-slate-300">{label}</span>
              </div>
            ))}
          </div>

          <Link href="/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base shadow-lg shadow-brand-500/30">
            <Users className="w-5 h-5" />
            Únete gratis — sé de los primeros
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" inverted />
          <p className="text-sm text-center">
            ChambaLatinApp © {new Date().getFullYear()} · Conectamos talento con oportunidades
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Iniciar sesión</Link>
            <Link href="/register" className="hover:text-white transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
