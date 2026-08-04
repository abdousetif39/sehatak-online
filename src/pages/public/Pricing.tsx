import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export default function Pricing() {
  const { t } = useTranslation();

  const features = [
    t('feature_1'),
    t('feature_2'),
    t('feature_3'),
    t('feature_4'),
    t('feature_5'),
    t('feature_6'),
    t('feature_7'),
    t('feature_8'),
    t('feature_9')
  ];

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('subscription_plans')}</h1>
        <p className="text-lg text-slate-600">{t('subscription_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {/* 3 Months Plan */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('plan_3_months')}</h3>
            <div className="text-4xl font-extrabold text-blue-600 mb-4">{t('price_4000')}</div>
            <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm">
              {t('free_15_days')}
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-slate-900 font-medium mb-4">{t('includes')}</p>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 6 Months Plan */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('plan_6_months')}</h3>
            <div className="text-4xl font-extrabold text-blue-600 mb-4">{t('price_6000')}</div>
            <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm">
              {t('free_1_month')}
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-slate-900 font-medium mb-4">{t('includes')}</p>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 12 Months Plan */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('plan_12_months')}</h3>
            <div className="text-4xl font-extrabold text-blue-600 mb-4">{t('price_10000')}</div>
            <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full font-medium text-sm">
              {t('free_1_month')}
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-slate-900 font-medium mb-4">{t('includes')}</p>
            <ul className="space-y-3">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 text-center shadow-sm border border-slate-200 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('subscribe_question')}</h2>
        <p className="text-slate-600 mb-6">{t('subscribe_contact_text')}</p>
        <a 
          href="mailto:sehatakonline@gmail.com" 
          className="inline-flex items-center gap-2 text-lg font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors bg-blue-50 px-6 py-3 rounded-2xl"
          dir="ltr"
        >
          📧 sehatakonline@gmail.com
        </a>
      </div>
    </div>
  );
}
