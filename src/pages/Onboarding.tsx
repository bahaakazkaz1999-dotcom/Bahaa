import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserRole, User as AppUser } from '../types';
import { Phone, User as UserIcon, ShieldCheck, Camera, Check, ChevronLeft, ChevronRight, Heart, HandHelping, Smartphone, Upload, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  user: FirebaseUser;
  userData: AppUser | null;
}

type Step = 'info' | 'phone' | 'verification' | 'id_upload' | 'role_selection';

export default function Onboarding({ user, userData }: OnboardingProps) {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<Step>('info');
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState(user.displayName || '');
  const [phone, setPhone] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [idFront, setIdFront] = React.useState<File | null>(null);
  const [idBack, setIdBack] = React.useState<File | null>(null);
  const [role, setRole] = React.useState<UserRole | null>(null);

  React.useEffect(() => {
    if (userData) navigate('/');
  }, [userData, navigate]);

  const handleNext = () => {
    if (step === 'info') setStep('phone');
    else if (step === 'phone') setStep('verification');
    else if (step === 'verification') setStep('id_upload');
    else if (step === 'id_upload') setStep('role_selection');
  };

  const handleBack = () => {
    if (step === 'phone') setStep('info');
    else if (step === 'verification') setStep('phone');
    else if (step === 'id_upload') setStep('verification');
    else if (step === 'role_selection') setStep('id_upload');
  };

  const handleSubmit = async () => {
    if (!role) return;
    setLoading(true);
    try {
      const newUserData: AppUser = {
        uid: user.uid,
        name: name,
        phone: phone,
        role: role,
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
        idFrontUrl: idFront ? 'simulated_url_front' : '',
        idBackUrl: idBack ? 'simulated_url_back' : '',
        totalDonated: 0,
        ratingCount: 0,
        ratingSum: 0,
        email: user.email || '',
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...newUserData,
        createdAt: serverTimestamp(),
      });
      navigate('/');
    } catch (error) {
      console.error("Onboarding failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12 font-sans relative overflow-hidden" dir="rtl">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-[30vh] bg-primary rounded-b-[80px] shadow-2xl shadow-primary/10 pointer-events-none opacity-10"></div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-white rounded-[48px] shadow-2xl shadow-slate-200 p-8 sm:p-16 relative z-10 border border-slate-100"
      >
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {['info', 'phone', 'verification', 'id_upload', 'role_selection'].map((s, i) => (
            <div 
              key={s} 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                ['info', 'phone', 'verification', 'id_upload', 'role_selection'].indexOf(step) >= i ? "w-12 bg-primary shadow-lg shadow-primary/20" : "w-6 bg-slate-100"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="info" className="space-y-10">
              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">مرحباً بك في سند</h2>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">لنبدأ بالتعريف، أدخل اسمك الكامل</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">الاسم الكامل (كما في الهوية)</label>
                <div className="relative group">
                  <UserIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    className="w-full pr-16 pl-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold"
                    placeholder="اكتب اسمك الثلاثي..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={!name.trim()}
                onClick={handleNext}
                className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
              >
                المتابعة
              </button>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="phone" className="space-y-10">
              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">رقم الجوال</h2>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">سنرسل لك رمزاً للتحقق من الرقم</p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-2">رقم الجوال</label>
                <div className="relative group">
                  <Smartphone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    className="w-full pr-16 pl-20 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-left"
                    placeholder="05XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold" dir="ltr">+966</span>
                </div>
              </div>

              <div className="flex gap-4">
                 <button onClick={handleBack} className="w-1/3 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition-all">رجوع</button>
                 <button
                    disabled={phone.length < 9}
                    onClick={handleNext}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                  >
                    إرسال الرمز
                  </button>
              </div>
            </motion.div>
          )}

          {step === 'verification' && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="verification" className="space-y-10">
              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">تأكيد الرمز</h2>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">أدخل الرمز المكون من 4 أرقام</p>
              </div>

              <div className="flex justify-center gap-4 py-4" dir="ltr">
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-48 text-center text-4xl font-black tracking-[1em] py-5 bg-slate-50 border border-slate-100 rounded-[32px] focus:bg-white focus:ring-8 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-200"
                    placeholder="0000"
                  />
              </div>

              <div className="flex gap-4">
                 <button onClick={handleBack} className="w-1/3 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition-all">رجوع</button>
                 <button
                    disabled={otp.length !== 4}
                    onClick={handleNext}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                  >
                    تأكيد الرمز
                  </button>
              </div>
            </motion.div>
          )}

          {step === 'id_upload' && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="id_upload" className="space-y-10">
              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">توثيق الهوية</h2>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">ارفع صورة الهوية من الوجهين للتحقق</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="block w-full border-4 border-dashed border-slate-100 rounded-[40px] p-8 text-center hover:border-primary cursor-pointer transition-all bg-slate-50/50 group relative overflow-hidden">
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => setIdFront(e.target.files?.[0] || null)} />
                   {idFront ? (
                     <div className="space-y-2 relative z-10">
                       <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                          <Check className="w-8 h-8" />
                       </div>
                       <p className="text-xs font-bold text-slate-900 truncate px-4">{idFront.name}</p>
                     </div>
                   ) : (
                     <div className="space-y-4 relative z-10 transition-transform group-hover:-translate-y-1">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300 group-hover:text-primary transition-colors">
                          <Upload className="w-8 h-8" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوجه الأمامي</p>
                     </div>
                   )}
                </label>
                
                <label className="block w-full border-4 border-dashed border-slate-100 rounded-[40px] p-8 text-center hover:border-primary cursor-pointer transition-all bg-slate-50/50 group relative overflow-hidden">
                   <input type="file" className="hidden" accept="image/*" onChange={(e) => setIdBack(e.target.files?.[0] || null)} />
                   {idBack ? (
                     <div className="space-y-2 relative z-10">
                       <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                          <Check className="w-8 h-8" />
                       </div>
                       <p className="text-xs font-bold text-slate-900 truncate px-4">{idBack.name}</p>
                     </div>
                   ) : (
                     <div className="space-y-4 relative z-10 transition-transform group-hover:-translate-y-1">
                       <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300 group-hover:text-primary transition-colors">
                          <Upload className="w-8 h-8" />
                       </div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">الوجه الخلفي</p>
                     </div>
                   )}
                </label>
              </div>

              <div className="flex gap-4">
                 <button onClick={handleBack} className="w-1/3 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition-all">رجوع</button>
                 <button
                    disabled={!idFront || !idBack}
                    onClick={handleNext}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
                  >
                    المتابعة
                  </button>
              </div>
            </motion.div>
          )}

          {step === 'role_selection' && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} key="role_selection" className="space-y-10">
              <div className="text-center space-y-3">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">حدد دورك</h2>
                 <p className="text-slate-500 text-lg font-medium leading-relaxed">كيف تريد المساهمة في منصة سند؟</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { type: 'donor', title: 'أريد الدعم', desc: 'للمساهمة ودعم الحالات المحتاجة', icon: Heart, bg: 'bg-primary-light', text: 'text-primary' },
                  { type: 'beneficiary', title: 'أحتاج للدعم', desc: 'لنشر الحالات وطلب المساندة', icon: UserCircle, bg: 'bg-emerald-50', text: 'text-emerald-600' }
                ].map((r) => (
                  <button
                    key={r.type}
                    onClick={() => setRole(r.type as any)}
                    className={cn(
                      "p-8 rounded-[40px] border-4 transition-all text-right group relative overflow-hidden",
                      role === r.type ? "border-primary bg-primary-light/30 shadow-xl" : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                    )}
                  >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm", r.bg, r.text)}>
                       <r.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 leading-none">{r.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{r.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                 <button onClick={handleBack} className="w-1/3 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black hover:bg-slate-100 transition-all">رجوع</button>
                 <button
                    disabled={!role || loading}
                    onClick={handleSubmit}
                    className="flex-1 py-5 bg-primary text-white rounded-[24px] font-black text-xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-7 h-7" />
                        إتمام التسجيل
                      </>
                    )}
                  </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
