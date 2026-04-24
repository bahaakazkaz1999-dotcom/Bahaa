import React from 'react';
import { User as AppUser, Case, Donation } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, ShieldCheck, Phone, ArrowUpRight, Star, CheckCircle, Clock, TrendingUp, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProfileProps {
  userData: AppUser | null;
}

export default function Profile({ userData }: ProfileProps) {
  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [userCases, setUserCases] = React.useState<Case[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [ratingModal, setRatingModal] = React.useState<Donation | null>(null);
  const [ratingValue, setRatingValue] = React.useState(5);
  const [ratingComment, setRatingComment] = React.useState('');
  const [submittingRating, setSubmittingRating] = React.useState(false);

  React.useEffect(() => {
    if (!userData) return;
    async function fetchData() {
      try {
        if (userData.role === 'donor') {
          const q = query(collection(db, 'donations'), where('donorId', '==', userData.uid));
          const snap = await getDocs(q);
          setDonations(snap.docs.map(d => ({ id: d.id, ...d.data() } as Donation)));
        } else {
          const q = query(collection(db, 'cases'), where('beneficiaryId', '==', userData.uid));
          const snap = await getDocs(q);
          const cases = snap.docs.map(d => ({ id: d.id, ...d.data() } as Case));
          setUserCases(cases);

          const caseIds = cases.map(c => c.id);
          if (caseIds.length > 0) {
            const dq = query(collection(db, 'donations'), where('caseId', 'in', caseIds.slice(0, 10)));
            const dSnap = await getDocs(dq);
            setDonations(dSnap.docs.map(d => ({ id: d.id, ...d.data() } as Donation)));
          }
        }
      } catch (error) {
        console.error("Error fetching profile data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userData]);

  const handleRate = async () => {
    if (!ratingModal || !userData) return;
    setSubmittingRating(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        donorId: ratingModal.donorId,
        beneficiaryId: userData.uid,
        rating: ratingValue,
        comment: ratingComment,
        createdAt: new Date().toISOString()
      });

      const donorRef = doc(db, 'users', ratingModal.donorId);
      await updateDoc(donorRef, {
        ratingSum: increment(ratingValue),
        ratingCount: increment(1)
      });

      setRatingModal(null);
      setRatingValue(5);
      setRatingComment('');
    } catch (error) {
      console.error("Rating failed", error);
    } finally {
      setSubmittingRating(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-10 font-sans pb-20" dir="rtl">
      {/* Header Info */}
      <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-right">
         <div className="w-32 h-32 bg-primary-light text-primary rounded-[35px] flex items-center justify-center shrink-0 border-4 border-white shadow-xl shadow-primary-light/50 relative">
            <UserIcon className="w-16 h-16" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
         </div>
         <div className="flex-1 space-y-6">
            <div>
               <h1 className="text-4xl font-black text-slate-900 mb-1 leading-none tracking-tight">{userData.name}</h1>
               <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black tracking-widest uppercase">
                    {userData.role === 'donor' ? 'داعم مجتمعي' : 'مستفيد مسجل'}
                  </span>
                  <span className={cn(
                    "px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2",
                    userData.verificationStatus === 'verified' ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {userData.verificationStatus === 'verified' ? <ShieldCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {userData.verificationStatus === 'verified' ? 'حساب موثق' : 'قيد التدقيق'}
                  </span>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
               <div className="flex items-center gap-3 text-slate-500 sm:justify-start justify-center">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <span dir="ltr" className="font-bold text-sm">{userData.phone}</span>
               </div>
               <div className="flex items-center gap-3 text-slate-500 sm:justify-start justify-center">
                  <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">
                     <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <span className="font-bold text-sm">التقييم: {((userData.ratingSum || 0) / (userData.ratingCount || 1)).toFixed(1)} / 5</span>
               </div>
            </div>
         </div>
         <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
            تعديل المعلومات
         </button>
      </section>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Left Column: Stats & Lists */}
         <div className="lg:col-span-2 space-y-10">
            <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-slate-200 shadow-sm">
               <h2 className="text-2xl font-black text-slate-900 mb-10 border-r-8 border-primary pr-6 leading-none">
                 {userData.role === 'donor' ? 'سجل المساهمات' : 'قائمة الطلبات'}
               </h2>
               
               <div className="space-y-6">
                  {userData.role === 'donor' ? (
                    donations.length > 0 ? donations.map(d => (
                      <div key={d.id} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-primary-light transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                               <TrendingUp className="w-8 h-8" />
                            </div>
                            <div>
                               <p className="text-xl font-black text-slate-900">سددت {d.amount} ل.س</p>
                               <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">{new Date(d.createdAt).toLocaleDateString('ar-SA')}</p>
                            </div>
                         </div>
                         <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    )) : <p className="text-center text-slate-400 font-bold py-16 italic">لا توجد مساهمات مسجلة بعد.</p>
                  ) : (
                    userCases.length > 0 ? userCases.map(c => (
                      <div key={c.id} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6 group hover:bg-primary-light transition-all">
                         <div className="flex justify-between items-start">
                            <h4 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{c.title}</h4>
                            <span className={cn(
                              "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm",
                              c.status === 'approved' ? "bg-indigo-50 text-indigo-700" :
                              c.status === 'pending' ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                            )}>
                              {c.status === 'approved' ? 'معتمدة' : c.status === 'pending' ? 'تحت التدقيق' : 'تكتملت'}
                            </span>
                         </div>
                         <div className="flex justify-between items-end gap-6">
                            <div className="flex-1">
                               <div className="flex justify-between mb-2">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">مستوى الإنجاز</span>
                                  <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{Math.round((c.currentAmount/c.targetAmount)*100)}%</span>
                               </div>
                               <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{width: `${(c.currentAmount/c.targetAmount)*100}%`}} />
                               </div>
                               <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">تم جمع {c.currentAmount} من {c.targetAmount} ل.س</p>
                            </div>
                         </div>
                      </div>
                    )) : <p className="text-center text-slate-400 font-bold py-16 italic">لم تقدم أي طلبات بعد.</p>
                  )}
               </div>
            </section>

            {userData.role === 'beneficiary' && (
              <section className="bg-white p-8 sm:p-10 rounded-[40px] border border-slate-200 shadow-sm">
                 <h2 className="text-2xl font-black text-slate-900 mb-8 border-r-8 border-amber-500 pr-6 leading-none">تقييم الداعمين</h2>
                 <p className="text-sm text-slate-500 mb-10 font-medium leading-relaxed max-w-lg">بإمكانك التعبير عن امتنانك للداعمين من خلال تقييم مساهماتهم. تقييمك يساعد في توثيق موثوقية الداعم في مجتمع سند.</p>
                 
                 <div className="space-y-6">
                    {donations.length > 0 ? donations.map(d => (
                      <div key={d.id} className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:bg-amber-50 transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm transition-transform group-hover:scale-110">
                               <Heart className="w-8 h-8 fill-current" />
                            </div>
                            <div>
                               <p className="text-xl font-bold text-slate-900">{d.donorName}</p>
                               <p className="text-[10px] text-slate-400 font-black mt-1 uppercase tracking-widest">ساهم بمبلغ {d.amount} ل.س لحالتك</p>
                            </div>
                         </div>
                         <button 
                          onClick={() => setRatingModal(d)}
                          className="px-6 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl text-sm font-black hover:bg-amber-500 hover:text-white transition-all shadow-sm active:scale-95"
                         >
                            تقييم الآن
                         </button>
                      </div>
                    )) : <p className="text-center text-slate-400 font-bold py-16 italic">لا يوجد داعمون بانتظار التقييم حالياً.</p>}
                 </div>
              </section>
            )}
         </div>

         {/* Right Column: ID/Verification Sidebar */}
         <div className="space-y-10">
            <section className="bg-slate-950 text-white p-8 sm:p-10 rounded-[40px] shadow-2xl shadow-slate-200 relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-xl font-black mb-8 border-r-4 border-primary pr-4 leading-none uppercase tracking-tight">المستندات الرسمية</h3>
                  <div className="space-y-8">
                     <div className="bg-white/5 p-8 rounded-[32px] border border-white/10 backdrop-blur-md">
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-6">حالة التحقق الأمنية</p>
                        <div className="flex items-center gap-6">
                           <div className={cn(
                             "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform hover:scale-110",
                             userData.verificationStatus === 'verified' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-amber-500 text-white shadow-amber-500/20"
                           )}>
                              {userData.verificationStatus === 'verified' ? <CheckCircle className="w-9 h-9" /> : <Clock className="w-9 h-9" />}
                           </div>
                           <div>
                              <p className="font-black text-xl tracking-tight leading-none">{userData.verificationStatus === 'verified' ? 'تم التوثيق' : 'قيد التدقيق'}</p>
                              <p className="text-[10px] font-bold text-white/30 mt-2 uppercase leading-relaxed tracking-wider">
                                 {userData.verificationStatus === 'verified' ? 'حسابك معتمد لدى سند' : 'جاري تدقيق البيانات'}
                              </p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-widest px-2">الهوية الوطنية</p>
                        <div className="aspect-[1.6/1] bg-slate-900 rounded-3xl flex items-center justify-center border border-white/5 p-2 overflow-hidden group cursor-pointer relative shadow-inner">
                           <img src="https://via.placeholder.com/400x250?text=IDENTIFICATION" className="opacity-20 grayscale group-hover:scale-110 group-hover:opacity-30 transition-all duration-700" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              <ShieldCheck className="w-10 h-10 text-white/10 group-hover:text-primary/40 transition-colors" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            </section>

            <div className="bg-primary p-10 rounded-[40px] text-white space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-2xl font-black italic tracking-tighter">ساعد باحترافية وأمان</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed opacity-80">
                     نحن نوفر لك الأدوات اللازمة للتحقق، يرجى دائماً إبقاء بياناتك محدثة لضمان استمرارية الخير.
                  </p>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            </div>
         </div>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {ratingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !submittingRating && setRatingModal(null)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
            <motion.div initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.9 }} className="relative bg-white w-full max-w-lg rounded-[48px] p-10 sm:p-14 shadow-2xl overflow-hidden text-center">
               <div className="space-y-10">
                  <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-[32px] flex items-center justify-center mx-auto shadow-lg shadow-amber-50 border-4 border-white">
                     <Star className="w-12 h-12 fill-current" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">تقييم المساهمة</h2>
                    <p className="text-slate-500 font-medium">كيف تصف تجربتك مع الداعم <span className="text-primary font-bold">{ratingModal.donorName}</span>؟</p>
                  </div>

                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map(v => (
                       <button 
                        key={v} 
                        onClick={() => setRatingValue(v)}
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm",
                          ratingValue >= v ? "bg-amber-100 text-amber-600 scale-110 shadow-amber-200/50" : "bg-slate-50 text-slate-300"
                        )}
                       >
                         <Star className={cn("w-7 h-7", ratingValue >= v ? "fill-current" : "")} />
                       </button>
                    ))}
                  </div>

                  <textarea 
                    rows={4}
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[32px] focus:bg-white focus:ring-8 focus:ring-amber-500/10 focus:border-amber-400 outline-none transition-all placeholder:text-slate-300 italic text-sm font-medium"
                    placeholder="اكتب كلمة شكر أو ملاحظة (اختياري)..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                  />

                  <div className="flex gap-4">
                    <button onClick={() => setRatingModal(null)} className="w-1/3 py-5 bg-slate-50 text-slate-500 rounded-2xl font-black active:scale-95 transition-transform">إلغاء</button>
                    <button 
                      onClick={handleRate}
                      disabled={submittingRating}
                      className="w-2/3 py-5 bg-amber-500 text-white rounded-2xl font-black transition-all shadow-xl shadow-amber-200 hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95"
                    >
                       {submittingRating ? <span className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "نشر التقييم والخير"}
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
