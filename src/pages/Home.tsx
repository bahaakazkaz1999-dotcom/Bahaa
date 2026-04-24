import React from 'react';
import { Link } from 'react-router-dom';
import { User, Case } from '../types';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { Heart, TrendingUp, ShieldCheck, Clock, CheckCircle2, ChevronLeft, CreditCard } from 'lucide-react';
import { cn } from '../lib/utils';

interface HomeProps {
  userData: User;
}

export default function Home({ userData }: HomeProps) {
  const [recentCases, setRecentCases] = React.useState<Case[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const casesRef = collection(db, 'cases');
        const q = userData.role === 'beneficiary' 
          ? query(casesRef, where('beneficiaryId', '==', userData.uid), limit(5))
          : query(casesRef, where('status', '==', 'approved'), limit(5));
        
        const snap = await getDocs(q);
        setRecentCases(snap.docs.map(d => ({ id: d.id, ...d.data() } as Case)));
      } catch (error) {
        console.error("Error fetching home data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userData]);

  const donorStats = [
    { label: 'إجمالي الدعم', value: `${userData.totalDonated || 0} ل.س`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary-light' },
    { label: 'التقييم العام', value: `${((userData.ratingSum || 0) / (userData.ratingCount || 1)).toFixed(1)} / 5`, icon: Heart, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'الموثوقية', value: userData.verificationStatus === 'verified' ? 'موثق' : 'قيد التدقيق', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-10 font-sans max-w-6xl">
      {/* Welcome Section */}
      <section className="bg-primary rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">لوحة التحكم</span>
          <h1 className="text-4xl font-black mb-3 text-white tracking-tight">مرحباً، {userData.name}</h1>
          <p className="text-indigo-100 text-lg opacity-90 max-w-md leading-relaxed">
            {userData.role === 'donor' 
              ? 'مساهماتك تغير حياة الكثيرين، شكراً لعطائك الدائم.' 
              : 'نحن هنا لنساندك، قدم طلبك وسيقوم فريقنا بمراجعته قريباً.'}
          </p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            {userData.role === 'donor' ? (
              <Link to="/cases" className="px-8 py-4 bg-white text-primary rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-1">
                استعراض الحالات المحتاجة
              </Link>
            ) : (
              <Link to="/create-case" className="px-8 py-4 bg-white text-primary rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-lg hover:-translate-y-1">
                نشر حالة جديدة
              </Link>
            )}
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      </section>

      {/* Stats Section (Donor Only) */}
      {userData.role === 'donor' && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {donorStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:shadow-md transition-shadow"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("w-8 h-8", stat.color)} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>
      )}

      {/* Recent Activity / Cases */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 border-r-4 border-primary pr-4 leading-none">
              {userData.role === 'beneficiary' ? 'حالاتي' : 'الحالات المتاحة للدعم'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 pr-4">حالات تم تدقيقها والموافقة عليها من قبل الإدارة</p>
          </div>
          <Link to={userData.role === 'beneficiary' ? '/profile' : '/cases'} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white border border-slate-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : recentCases.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentCases.map((c) => (
              <motion.div
                key={c.id}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group transition-all"
              >
                <div className="p-8 flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <span className={cn(
                      "px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider",
                      c.status === 'approved' ? "bg-indigo-50 text-indigo-700" :
                      c.status === 'pending' ? "bg-amber-50 text-amber-700" :
                      c.status === 'completed' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                    )}>
                      {c.status === 'approved' ? 'حالة معتمدة' : c.status === 'pending' ? 'قيد المراجعة' : c.status === 'completed' ? 'تكتملت المساعدة' : 'مرفوض'}
                    </span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-primary transition-colors">{c.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 mb-6">{c.description}</p>
                </div>
                
                <div className="bg-slate-50/50 p-8 pt-0 flex-none space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المبلغ المتبقي</span>
                      <span className="text-sm font-black text-primary">{c.targetAmount - c.currentAmount} ل.س</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((c.currentAmount / c.targetAmount) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-left text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                      {Math.round((c.currentAmount / c.targetAmount) * 100)}% تم إنجازه
                    </p>
                  </div>
                  
                  {userData.role === 'donor' && c.status === 'approved' && (
                     <Link to={`/cases?id=${c.id}`} className="block w-full py-4 bg-primary text-white rounded-xl font-bold text-center hover:bg-primary-dark transition-all shadow-lg shadow-primary/10">
                        سـاهم الآن
                     </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-lg">لا توجد حالات حالياً</p>
            <p className="text-slate-300 text-sm mt-2">سيتم إخطارك فور توفر حالات جديدة</p>
          </div>
        )}
      </section>
    </div>
  );
}
