import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { RequestDetail as RequestDetailType } from '@/types';

export type RequestDetail = RequestDetailType & { id: number };

interface GoodsListProps {
  goods: RequestDetail[];
  setGoods: React.Dispatch<React.SetStateAction<RequestDetail[]>>;
}

const GoodsList: React.FC<GoodsListProps> = ({ goods, setGoods }) => {
  const { t } = useLanguage();

  const handleAddRow = () => {
    const newRow: RequestDetail = {
      id: goods?.length > 0 ? Math.max(...goods?.map(g => g.id)) + 1 : 1,
      transfer_detail: '',
      signs: '',
      number_of_parcel: 0,
      description: '',
      weight: 0,
      net_weight: 0,
      client_id: 0,
      user_id: 0,
      invoice_number: '',
      invoice_date: '', 
      company_name: '',
      company_name_en: '',
      commercial_number: '',
      activity_type: '',
      address: '',
      phone_number: '',
      email: '',
      identity_number: '',
      mobile_number: '',
      item_cost: 0,
      quantity: 0,
      standard_of_origin: '',
      for_official_use: '',
      country_producer: '',
      serial_number: '',
      client_name: '',
    };
    setGoods([...goods, newRow]);
  };

  const handleRemoveRow = (id: number) => {
    setGoods(goods.filter(g => g.id !== id));
  };

  const handleInputChange = (id: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (e.target instanceof HTMLTextAreaElement) {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    }

    const newGoods = goods?.map(good => {
      if (good.id === id) {
        const parsedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
        return { ...good, [name]: parsedValue };
      }
      return good;
    });
    setGoods(newGoods);
  };

  return (
    <div className="goods-grid-container mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {t('staffPages.grid.goodsList')}
        </h3>
        <button 
          type="button" 
          onClick={handleAddRow} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          disabled={goods?.length >= 1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('staffPages.forms.addNewRow')}
        </button>
      </div>
      
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-2/12">
                {t('staffPages.grid.nameType')}
              </th>
              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-2/12">
                {t('staffPages.grid.goodsType')}
              </th>
              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-2/12">
                {t('staffPages.grid.standardOfOrigin')}
              </th>
              <th colSpan={2} className="px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-3/12">
                {t('staffPages.grid.weight')}
              </th>
              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-1/12 ">
                {t('staffPages.grid.quantity')}
              </th>
              <th className="px-2 py-1 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-2/12">
                {t('staffPages.grid.value')}
              </th>
              <th className="px-2 py-1 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 w-1/12">
                {t('staffClientDocumentRequest.actions')}
              </th>
            </tr>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/12"></th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/12"></th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/12"></th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-2/12">
                {t('staffClientDocumentRequest.netWeight')}
              </th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center w-2/12">
                {t('staffPages.grid.totalWeight')}
              </th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/12"></th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-2/12"></th>
              <th className="px-6 py-3 text-xs  font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/12"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {goods?.map((good, index) => (
              <tr key={good.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <td className="px-2 py-1 w-2/12">
                  <textarea 
                    name="signs" 
                    value={good.signs} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none overflow-hidden bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs" 
                    rows={1}
                    placeholder={t('staffPages.forms.signs')}
                  />
                </td>
                <td className="px-2 py-1 w-2/12">
                  <textarea 
                    name="activity_type" 
                    value={good.activity_type} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none overflow-hidden bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs" 
                    rows={1}
                    placeholder={t('staffPages.forms.goodsList.goodsType')}
                  />
                </td>
                <td className="px-2 py-1 w-2/12">
                  <textarea 
                    name="standard_of_origin" 
                    value={good.standard_of_origin} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none overflow-hidden bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs" 
                    rows={1}
                    placeholder={t('staffPages.forms.standardOfOrigin')}
                  />
                </td>
                <td className="px-2 py-1 w-2/12">
                  <input 
                    type="number" 
                    name="net_weight" 
                    value={good.net_weight} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs text-center" 
                    placeholder="0"
                  />
                </td>
                <td className="px-2 py-1 w-2/12">
                  <input 
                    type="number" 
                    name="weight" 
                    value={good.weight} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs text-center" 
                    placeholder="0"
                  />
                </td>
                <td className="px-2 py-1 w-1/12">
                  <input 
                    type="number" 
                    name="quantity" 
                    value={good.quantity} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs text-center" 
                    placeholder="0"
                  />
                </td>
                <td className="px-2 py-1 w-3/12">
                  <input 
                    type="number" 
                    name="item_cost" 
                    value={good.item_cost} 
                    onChange={(e) => handleInputChange(good.id, e)} 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-xs text-center" 
                    placeholder="0"
                  />
                </td>
                <td className="px-2 py-1 w-1/12 text-center">
                  <button 
                    onClick={() => handleRemoveRow(good.id)} 
                    className="inline-flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                    title="حذف الصف"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {goods?.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-2 text-xs font-medium text-gray-900 dark:text-gray-100">{t('staffClientDocumentRequest.noGoods')}</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('staffClientDocumentRequest.startAddingGoods')}</p>
        </div>
      )}
    </div>
  );
};

export default GoodsList;