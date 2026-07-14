import { useState } from "react";
import {
  GraduationCap,
  UserCog,
  ShieldCheck,
  Eye,
  EyeOff,
  Info,
  ArrowRight,
  Lock,
  Phone,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useIms } from "./store";
import type { Role } from "@/lib/ims-data";

type Language = "UZ" | "RU" | "EN";

interface RedesignedLoginProps {
  onLogin: () => void;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  UZ: {
    brand_name: "Talaba",
    brand_subtitle: "Talabalarni boshqarish platformasi",
    headline_1: "Tizimli boshqaruv,",
    headline_2: "ishonchli natijalar.",
    desc: "Talabalar, mentorlar va koordinatorlar uchun maxsus loyihalashtirilgan zamonaviy amaliyot boshqaruvi platformasi.",
    feat_1_title: "Xavfsiz autentifikatsiya",
    feat_1_desc: "Ma'lumotlaringiz eng yuqori darajada himoyalangan.",
    feat_2_title: "Tez va qulay kirish",
    feat_2_desc: "Bir necha soniyada tizimga kiring va ishni davom ettiring.",
    feat_3_title: "Korxona darajasidagi platforma",
    feat_3_desc: "Barqaror, ishonchli va doimo siz bilan.",
    copyright: "© 2026 Talaba Platform. Barcha huquqlar himoyalangan.",
    welcome: "Xush kelibsiz",
    welcome_sub: "Amaliyotni davom ettirish uchun tizimga kiring",
    phone_label: "Telefon raqam",
    password_label: "Parol (KunOyYil, masalan: 12042003)",
    remember_me: "Meni eslab qolish",
    forgot_password: "Parolni unutdingizmi?",
    login_btn: "Kirish",
    pwd_info: "Eslatma: Tug'ilgan kuningiz sizning dastlabki parolingiz hisoblanadi.",
    pwd_format: "Format: DDMMYYYY",
    role_label: "Tizimga kirish turi",
    role_student: "Talaba",
    role_mentor: "Rahbar",
    role_admin: "Koordinator",
    support_text: "Yordam kerakmi?",
    support_link: "Qo'llab-quvvatlash xizmati",
  },
  RU: {
    brand_name: "Студент",
    brand_subtitle: "Платформа управления студентами",
    headline_1: "Системное управление,",
    headline_2: "надежные результаты.",
    desc: "Современная платформа управления стажировками, разработанная специально для студентов, менторов и координаторов.",
    feat_1_title: "Безопасная аутентификация",
    feat_1_desc: "Ваши данные защищены на самом высоком уровне.",
    feat_2_title: "Быстрый и удобный вход",
    feat_2_desc: "Войдите в систему за пару секунд и продолжайте работу.",
    feat_3_title: "Платформа корпоративного уровня",
    feat_3_desc: "Стабильно, надежно и всегда с вами.",
    copyright: "© 2026 Платформа Талаба. Все права защищены.",
    welcome: "Добро пожаловать",
    welcome_sub: "Войдите в систему для продолжения стажировки",
    phone_label: "Номер телефона",
    password_label: "Пароль (ДеньМесяцГод, например: 12042003)",
    remember_me: "Запомнить меня",
    forgot_password: "Забыли пароль?",
    login_btn: "Войти",
    pwd_info: "Примечание: Дата вашего рождения является вашим первоначальным паролем.",
    pwd_format: "Формат: ДДММГГГГ",
    role_label: "Тип входа в систему",
    role_student: "Студент",
    role_mentor: "Руководитель",
    role_admin: "Координатор",
    support_text: "Нужна помощь?",
    support_link: "Служба поддержки",
  },
  EN: {
    brand_name: "Student",
    brand_subtitle: "Student Management Platform",
    headline_1: "Systemic management,",
    headline_2: "reliable results.",
    desc: "Modern internship management platform specifically designed for students, mentors, and coordinators.",
    feat_1_title: "Secure Authentication",
    feat_1_desc: "Your data is protected at the highest level.",
    feat_2_title: "Fast & Convenient Access",
    feat_2_desc: "Sign in within seconds and continue your work.",
    feat_3_title: "Enterprise-grade Platform",
    feat_3_desc: "Stable, reliable, and always with you.",
    copyright: "© 2026 Talaba Platform. All rights reserved.",
    welcome: "Welcome",
    welcome_sub: "Sign in to continue your internship",
    phone_label: "Phone number",
    password_label: "Password (DDMMYYYY, e.g. 12042003)",
    remember_me: "Remember me",
    forgot_password: "Forgot password?",
    login_btn: "Sign In",
    pwd_info: "Note: Your date of birth acts as your default password.",
    pwd_format: "Format: DDMMYYYY",
    role_label: "System access type",
    role_student: "Student",
    role_mentor: "Mentor",
    role_admin: "Coordinator",
    support_text: "Need help?",
    support_link: "Support service",
  },
};

export function RedesignedLogin({ onLogin }: RedesignedLoginProps) {
  const { role, setRole, students, mentors, currentStudentId, currentMentorId, lang, setLang } = useIms();
  const [phoneNumber, setPhoneNumber] = useState("90 123 45 67");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const language = lang.toUpperCase() as Language;
  const setLanguage = (newLang: Language) => setLang(newLang.toLowerCase() as "uz" | "ru" | "en");

  const t = DICTIONARY[language];


  const featureItems = [
    {
      title: t.feat_1_title,
      desc: t.feat_1_desc,
      icon: Lock,
    },
    {
      title: t.feat_2_title,
      desc: t.feat_2_desc,
      icon: CheckCircle,
    },
    {
      title: t.feat_3_title,
      desc: t.feat_3_desc,
      icon: ShieldCheck,
    },
  ];

  // Telefon raqamini formatlash (XX XXX XX XX)
  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 9);
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)} ${clean.slice(2)}`;
    }
    if (clean.length > 5) {
      formatted = `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
    }
    if (clean.length > 7) {
      formatted = `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7)}`;
    }
    setPhoneNumber(formatted);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    let targetName = "";
    if (role === "student") {
      const s = students.find((x) => x.id === currentStudentId) ?? students[0];
      targetName = s.name;
    } else if (role === "mentor") {
      const m = mentors.find((x) => x.id === currentMentorId) ?? mentors[0];
      targetName = m.name;
    } else {
      targetName = "Koordinator (Admin)";
    }

    const welcomeMsg = language === "UZ" 
      ? `Xush kelibsiz, ${targetName}!` 
      : language === "RU" 
        ? `Добро пожаловать, ${targetName}!` 
        : `Welcome, ${targetName}!`;

    toast.success(welcomeMsg);
    onLogin();
  };

  return (
    <div className="relative min-h-screen lg:h-screen lg:overflow-hidden w-full overflow-x-hidden bg-white text-foreground">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_70%)] blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.08),transparent_70%)] blur-[80px]" />
        <div className="absolute top-[30%] left-[20%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(192,132,252,0.06),transparent_60%)] blur-[60px]" />
      </div>

      {/* Main Two-Column Container */}
      <div className="relative z-10 mx-auto grid min-h-0 lg:min-h-screen lg:h-full max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-12 w-full min-w-0">
        {/* Left Side: Brand Experience */}
        <div className="flex flex-col justify-between py-8 lg:py-10 lg:h-full lg:col-span-5 lg:pr-8 animate-fade-in w-full min-w-0">
          {/* Logo and System Name */}
          <div className="space-y-5 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="gradient-primary grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white shadow-md shadow-primary/25">
                <GraduationCap className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight">{t.brand_name}</h2>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10 font-medium px-2 py-0 rounded-full text-[10px]">
                  {t.brand_subtitle}
                </Badge>
              </div>
            </div>

            {/* Headline & Desc */}
            <div className="space-y-3 pt-2 min-w-0">
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-slate-900 leading-tight">
                {t.headline_1} <br />
                <span className="text-transparent bg-clip-text gradient-primary font-black">{t.headline_2}</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t.desc}
              </p>
            </div>

            {/* Premium Feature Items */}
            <div className="space-y-4 pt-4 min-w-0">
              {featureItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex gap-3 items-start group min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-primary shadow-sm group-hover:bg-primary/5 group-hover:border-primary/25 transition-all duration-300">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-800">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Copyright (Desktop Only) */}
          <div className="hidden lg:block pt-6 text-xs text-muted-foreground border-t border-slate-100 lg:border-t-0">
            {t.copyright}
          </div>
        </div>

        {/* Right Side: Authentication */}
        <div className="flex flex-col items-center justify-start lg:justify-center pt-2 pb-8 lg:items-center lg:py-6 lg:h-full lg:col-span-7 w-full min-w-0">
          <div className="w-full max-w-[520px] animate-fade-up min-w-0">
            {/* Auth Card */}
            <div className="relative overflow-hidden rounded-[28px] border border-slate-100 bg-white/80 p-4 shadow-2xl shadow-slate-100 backdrop-blur-md sm:p-8 w-full">
              
              {/* Top Language Dropdown */}
              <div className="absolute right-4 top-4 z-20">
                <button
                  type="button"
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-1 rounded-full border border-slate-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all"
                >
                  <span>{language}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
                {showLangDropdown && (
                  <div className="absolute right-0 mt-1 w-16 origin-top-right rounded-lg border border-slate-100 bg-white shadow-lg ring-1 ring-black/5">
                    <button
                      onClick={() => {
                        setLanguage("UZ");
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-2 py-1.5 text-left text-[11px] font-medium hover:bg-slate-50 rounded-t-lg"
                    >
                      UZ
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("RU");
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-2 py-1.5 text-left text-[11px] font-medium hover:bg-slate-50"
                    >
                      RU
                    </button>
                    <button
                      onClick={() => {
                        setLanguage("EN");
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-2 py-1.5 text-left text-[11px] font-medium hover:bg-slate-50 rounded-b-lg"
                    >
                      EN
                    </button>
                  </div>
                )}
              </div>

              {/* Card Header / Icon */}
              <div className="mb-4 flex flex-col items-center text-center mt-6 sm:mt-0">
                <div className="mb-2 grid h-12 w-12 place-items-center rounded-full bg-primary/5 text-primary ring-6 ring-primary/5">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.welcome}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.welcome_sub}
                </p>
              </div>

              {/* Form fields */}
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Telephone input */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700">{t.phone_label}</label>
                  <div className="flex h-11 items-center rounded-[14px] border border-slate-200 bg-white px-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 w-full min-w-0">
                    <div className="flex items-center pr-2.5 border-r border-slate-150 h-5 shrink-0">
                      <span className="text-sm font-bold text-slate-800 leading-none flex items-center">+998</span>
                    </div>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="90 123 45 67"
                      className="h-full w-full pl-3 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none bg-transparent flex items-center min-w-0"
                    />
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">{t.password_label}</label>
                  <div className="flex h-11 items-center rounded-[14px] border border-slate-200 bg-white px-3 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 w-full min-w-0">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-full w-full text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me + Forgot Password */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary"
                    />
                    <span>{t.remember_me}</span>
                  </label>
                  <a href="#" className="text-[11px] font-bold text-primary hover:underline">
                    {t.forgot_password}
                  </a>
                </div>

                {/* Primary login button */}
                <Button
                  type="submit"
                  className="gradient-primary h-11 w-full rounded-[14px] text-xs font-bold text-white shadow-md shadow-primary/20 hover:opacity-95 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.99] transition-all duration-200 mt-1"
                >
                  <span>{t.login_btn}</span>
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>

                {/* Password Info card */}
                <div className="flex gap-2.5 items-start rounded-xl border border-slate-100 bg-slate-50/70 p-3 mt-1">
                  <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-slate-800 leading-tight">
                      {t.pwd_info}
                    </p>
                    <p className="text-[9px] font-bold text-primary">{t.pwd_format}</p>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="pt-3 border-t border-slate-50 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground block text-center">{t.role_label}</label>
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-50/80 p-1 border border-slate-100/50">
                    <button
                      type="button"
                      onClick={() => setRole("student")}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-0.5 transition-all ${
                        role === "student"
                          ? "bg-white text-primary shadow-xs font-bold scale-[1.01]"
                          : "text-muted-foreground hover:text-foreground font-semibold text-[10px]"
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-[9px]">{t.role_student}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("mentor")}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-0.5 transition-all ${
                        role === "mentor"
                          ? "bg-white text-primary shadow-xs font-bold scale-[1.01]"
                          : "text-muted-foreground hover:text-foreground font-semibold text-[10px]"
                      }`}
                    >
                      <UserCog className="h-4 w-4" />
                      <span className="text-[9px] whitespace-nowrap">{t.role_mentor}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("admin")}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 px-0.5 transition-all ${
                        role === "admin"
                          ? "bg-white text-primary shadow-xs font-bold scale-[1.01]"
                          : "text-muted-foreground hover:text-foreground font-semibold text-[10px]"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-[9px]">{t.role_admin}</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Support footer */}
              <div className="mt-4 text-center text-[10px] text-muted-foreground">
                {t.support_text}{" "}
                <a href="#" className="font-bold text-primary hover:underline">
                  {t.support_link}
                </a>
              </div>


            </div>
          </div>

          {/* Mobile-only Footer Copyright */}
          <div className="mt-8 text-center text-xs text-muted-foreground lg:hidden w-full px-4">
            {t.copyright}
          </div>
        </div>
      </div>
    </div>
  );
}
