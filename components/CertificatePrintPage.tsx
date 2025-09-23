import React from 'react';
import { useLanguage, TranslationKey } from '../contexts/LanguageContext';

import { DocumentRequest } from '../types';

interface CertificatePrintPageProps {
  request: DocumentRequest | null;
} 

const CertificatePrintPage = React.forwardRef<HTMLDivElement, CertificatePrintPageProps>(({ request }, ref) => {
    const { t: getTranslation } = useLanguage();

  if (!request || !request.details || request.details?.length === 0) {
    return <div ref={ref}>{getTranslation('manchaCert.noData', 'No data available to print.')}</div>;
  }

  const details = request.details[0];
  return (
        <div ref={ref} className="certificate-container" style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      color: '#000',
      backgroundColor: '#fff',
      border: '1px solid #000',
      direction: 'rtl'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: '0', fontWeight: 'bold' }}>
          {getTranslation('manchaCert.header.country', 'دولة ليبيا')}
        </h2>
        <h3 style={{ margin: '0', fontWeight: 'bold' }}>
          {getTranslation('manchaCert.header.title', 'شعــــادة منشــــــأ')}
        </h3>
      </div>

      {/* Agreement Info */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ margin: '0' }}>
          {getTranslation('manchaCert.agreement.text1', 'بموجب إنتقالية منطقة تبادل حر المؤقت بين الجمهورية التونسية ودولة ليبيا بتاريخ')}
          {' '}14/06/2001
        </p>
        <p style={{ margin: '0' }}>
          {getTranslation('manchaCert.agreement.text2', 'صادرة عن مصلحة الجمارك الليبية /...... رقم......')}
        </p>
      </div>

      {/* Main Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50%' }}>
              {getTranslation('manchaCert.table.source', 'المصدر وعنوانه /')}
            </th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '50%' }}>
              {getTranslation('manchaCert.table.producer', 'الشركات المنتجة /')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', height: '60px' }}>{details.client_name}</td>
            <td style={{ border: '1px solid #000', padding: '8px', height: '60px' }}>{details.company_name}</td>
          </tr>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
              {getTranslation('manchaCert.table.importer', 'المستورد وعنوانه /')}
            </th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
              {getTranslation('manchaCert.table.license', 'رقم وتاريخ الثانوية /')}
            </th>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', height: '60px' }}>{details.address}</td>
            <td style={{ border: '1px solid #000', padding: '8px', height: '60px' }}>{details.commercial_number}</td>
          </tr>
        </tbody>
      </table>

      {/* Goods Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '25%' }}>
              {getTranslation('manchaCert.goods.packages', 'عدد دفع وإرقام وعلامات الطرود')}
            </th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '25%' }}>
              {getTranslation('manchaCert.goods.type', 'نوع البشاعة')}
            </th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '25%' }}>
              {getTranslation('manchaCert.goods.quantity', 'الزرق')}
            </th>
            <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '25%' }}>
              {getTranslation('manchaCert.goods.value', 'القيمة بالمعلمة المحلية')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', height: '40px' }}>{details.number_of_parcel}</td>
            <td style={{ border: '1px solid #000', padding: '8px', height: '40px' }}>{request.title}</td>
            <td style={{ border: '1px solid #000', padding: '8px', height: '40px' }}>{details.weight}</td>
            <td style={{ border: '1px solid #000', padding: '8px', height: '40px' }}>{details.invoice_number}</td>
          </tr>
        </tbody>
      </table>

      {/* Total Value */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <p style={{ margin: '0' }}>
          {getTranslation('manchaCert.totalValue', 'القيمة الإجمالية: رقما وصحابية......')}
        </p>
      </div>

      {/* Production Elements */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0', textAlign: 'center' }}>
          {getTranslation('manchaCert.production.elements', 'بـ_____ أن عناصر الإنتاج_____')}
        </p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '10%' }}>
                {getTranslation('manchaCert.production.sequence', 'التربية')}
              </th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '45%' }}>
                {getTranslation('manchaCert.production.foreignCost', 'عناصر التكلفة الأجنبية')}
              </th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '20%' }}>
                {getTranslation('manchaCert.production.quantity', 'الحكيمية')}
              </th>
              <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '25%' }}>
                {getTranslation('manchaCert.production.value', 'القيمة')}
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4]?.map((item) => (
              <tr key={item}>
                <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{item}</td>
                <td style={{ border: '1px solid #000', padding: '8px', height: '30px' }}></td>
                <td style={{ border: '1px solid #000', padding: '8px', height: '30px' }}></td>
                <td style={{ border: '1px solid #000', padding: '8px', height: '30px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '55%' }}>
                {getTranslation('manchaCert.production.foreignCommittee', 'علانات لجنة أجنبية')}
              </td>
              <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '45%' }}>
                {getTranslation('manchaCert.production.total', 'المجموع')}
              </td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '8px', height: '40px' }}></td>
              <td style={{ border: '1px solid #000', padding: '8px', height: '40px' }}></td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                {getTranslation('manchaCert.production.finalCost', 'التكلفة النهائية للإنتاج')}
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000', padding: '8px', height: '40px' }}></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Exporter Declaration */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0' }}>
          {getTranslation('manchaCert.exporter.declaration', 'تصريح المصدر أصبح بصحة المعلمات الواردة أعلاه، وبأن البشائع هي من منشا......')}
        </p>
        <p style={{ margin: '10px 0' }}>
          {getTranslation('manchaCert.exporter.option1', 'ولن (1) القيمة المضافة المحلية:')}
          □ {getTranslation('manchaCert.exporter.option2', 'القيمة المضافة المقارنية:')}
        </p>
        <p style={{ margin: '0' }}>
          {getTranslation('manchaCert.exporter.percentage', 'تمثل نسبة رقما وصحابية: ...... من كفاءة الإنتاج الحالية:')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>
            {getTranslation('manchaCert.exporter.preparedAt', 'حرر في ......')}
          </span>
          <span>
            {getTranslation('manchaCert.exporter.signature', 'التوقيع')}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span>
            {getTranslation('manchaCert.exporter.date', 'بتاريخ ......')}
          </span>
        </div>
      </div>

      {/* Chamber of Commerce Section */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0' }}>
          {getTranslation('manchaCert.chamber.verification', 'تقييد ...... بأن السلع الموضع بياناتها أعلاه هي من منشا......')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>
            {getTranslation('manchaCert.chamber.preparedAt', 'حرر في ......')}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
          <span>
            {getTranslation('manchaCert.chamber.date', 'بتاريخ ......')}
          </span>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ margin: '0' }}>
            {getTranslation('manchaCert.chamber.signature', 'توقيع وختم مصلحة الجمارك الليبية:')}
          </p>
        </div>
      </div>

      {/* Authorities Section */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', height: '80px', width: '50%' }}>
              {getTranslation('manchaCert.authorities.customs', 'تأثيرة السلطات الجميعية')}
            </td>
            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', height: '80px', width: '50%' }}>
              {getTranslation('manchaCert.authorities.approving', 'توقيع وختم الجهة المصادقة:')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footnote */}
      <div style={{ marginTop: '10px', textAlign: 'start' }}>
        <p style={{ margin: '0', fontSize: '12px' }}>
          {getTranslation('manchaCert.footnote', '(أ) وضع علامة (X) في الخلقة المناسبة:')}
        </p>
      </div>
    </div>
  );
});

export default CertificatePrintPage;