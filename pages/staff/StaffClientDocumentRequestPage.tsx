import React, { useState, useEffect, useCallback, memo } from 'react';
import Card from '../../components/Card';
import GoodsList from '../../components/GoodsList';
import { RequestStatus, DocumentRequest, CertificateOfOriginData, CertificateType, User, UserRole, RequestDetail } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import CustomSelect from '../../components/CustomSelect';
import { listAdminUsers, mapApiUserToUser } from '../../services/userService';
import { getRequestTypes } from '../../services/requestTypeService';
import { createRequest } from '../../services/requestService';
import { getCurrentUser, getCurrentBranch } from '@/services/authService';
import { DocumentRequestBody, RequestType } from './types';
import toast from 'react-hot-toast';
import { FormInputField, FormInputFieldProps } from '@/components/FormInputField';

// Form input field component - moved outside to prevent loss of focus

const FormDateField = memo(({ name, label, value, required = true, onChange }: FormInputFieldProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="date"
        name={name}
        value={value || ''}
        onChange={onChange}
        className="mt-1 w-full p-2 border rounded-md dark:bg-gray-600 dark:border-gray-500 focus:ring-brand-primary focus:border-brand-primary"
        required={required}
      />
    </div>
  );
});


const StaffClientDocumentRequestPage: React.FC = () => {
  const { t: getTranslation } = useLanguage();
  const { user } = useAuth();
  const [loadingClients, setLoadingClients] = useState<boolean>(false);
  const [loadingRequestTypes, setLoadingRequestTypes] = useState<boolean>(false);
  const [clients, setClients] = useState<User[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [selectedRequestType, setSelectedRequestType] = useState<{ id: number, title: string } | null>(null);
  const [goods, setGoods] = useState<RequestDetail[]>([]);

  const [touched, setTouched] = useState<any>({});

  // Free Trade specific data
  const [foreignCostItems, setForeignCostItems] = useState<Array<{ id: string, description: string, quantity: number, value: number }>>([]);
  const [freeTradeExtraData, setFreeTradeExtraData] = useState<{ [key: string]: string | number }>({});
  const [freeTradeTouched, setFreeTradeTouched] = useState<{ [key: string]: boolean }>({});

  // Branch information
  const [currentBranch, setCurrentBranch] = useState<any>(null);

  // Form data state
  const [documentRequest, setDocumentRequest] = useState<DocumentRequestBody>({
    title: '',
    description: '',
    exporter_name: '',
    branch_id: 0,
    request_details: [{
      client_name: '',
      transfer_detail: null,
      signs: null,
      number_of_parcel: 0,
      description: null,
      weight: 0,
      client_id: null,
      user_id: 0,
      net_weight: 0,
      invoice_number: '',
      invoice_date: null,
      company_name: null,
      commercial_number: null,
      activity_type: null,
      address: null,
      phone_number: null,
      email: null,
      identity_number: '',
      mobile_number: '',
      company_name_en: null,
      quantity: 0,
      item_cost: 0,
      for_official_use: '',
      country_producer: '',
      standard_of_origin: '',
      serial_number: ''
    }]
  });

  // Load clients from API
  useEffect(() => {
    const loadClients = async () => {
      setLoadingClients(true);
      try {
        const response = await listAdminUsers();
        if (response.success) {
          // Extract users and filter for only member role
          const data = response.data;
          const userList = Array.isArray(data) ? data : (data?.data ?? data?.users ?? []);
          const mappedUsers = userList?.map(u => mapApiUserToUser(u))
            .filter(u => u.role === UserRole.Member);
          setClients(mappedUsers);
        } else {
          console.error('Failed to load clients:', response.message);
        }
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClients();
  }, []);

  // Load request types from API
  useEffect(() => {
    const loadRequestTypes = async () => {
      setLoadingRequestTypes(true);
      try {
        const response = await getRequestTypes();
        if (response.success && response.data) {
          // Extract request types from response
          const data = response.data.data.request_types;
          console.log(data);
          const requestTypeList = Array.isArray(data) ? data : [];
          setRequestTypes(requestTypeList);
        } else {
          console.error('Failed to load request types:', response.message);
        }
      } catch (error) {
        console.error('Error loading request types:', error);
      } finally {
        setLoadingRequestTypes(false);
      }
    };

    loadRequestTypes();
  }, []);


  console.log("RequestTypes", requestTypes);


  // Load branch information
  useEffect(() => {
    const branch = getCurrentBranch();
    if (branch) {
      setCurrentBranch(branch);
      // Pre-fill issue place with branch name
      setFreeTradeExtraData(prev => ({
        ...prev,
        issue_place: branch.name
      }));
    }
  }, []);

  // Auto-update total_value when item_cost changes for Free Trade Certificate
  useEffect(() => {
    if (selectedRequestType?.id === 2 && documentRequest.request_details[0].item_cost > 0) {
      const itemCost = documentRequest.request_details[0].item_cost;

      setFreeTradeExtraData(prev => ({
        ...prev,
        total_value: itemCost
      }));
    }
  }, [documentRequest.request_details[0].item_cost, selectedRequestType?.id]);

  // Free Trade specific handlers
  const addForeignCostItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      value: 0
    };
    setForeignCostItems(prev => [...prev, newItem]);
  };

  const removeForeignCostItem = (id: string) => {
    setForeignCostItems(prev => prev.filter(item => item.id !== id));
  };

  const updateForeignCostItem = (id: string, field: 'description' | 'quantity' | 'value', value: string | number) => {
    setForeignCostItems(prev => prev?.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleFreeTradeExtraDataChange = (key: string, value: string) => {
    setFreeTradeExtraData(prev => ({ ...prev, [key]: value }));
    setFreeTradeTouched(prev => ({ ...prev, [key]: true }));
  };

  // Function to fill all fields with test data
  const fillAllFieldsWithTestData = () => {
    // Fill basic document request data
    setDocumentRequest(prev => ({
      ...prev,
      title: getTranslation('staffClientDocumentRequest.testCompanyName'),
      description: getTranslation('staffClientDocumentRequest.testDescription'),
      exporter_name: getTranslation('staffClientDocumentRequest.testExporterAddress'),
      request_details: [{
        ...prev.request_details[0],
        client_name: getTranslation('staffClientDocumentRequest.testClientName'),
        transfer_detail: getTranslation('staffClientDocumentRequest.testTransferDetail'),
        signs: getTranslation('staffClientDocumentRequest.testParcelSigns'),
        number_of_parcel: 10,
        description: getTranslation('staffClientDocumentRequest.testGoodsDescription'),
        weight: 500,
        client_id: selectedClient ? parseInt(selectedClient, 10) : null,
        user_id: user?.id ? parseInt(user.id, 10) : 0,
        net_weight: 450,
        invoice_number: 'INV-2024-001',
        invoice_date: '2024-01-15',
        transport_details: getTranslation('staffClientDocumentRequest.testTransportDetails'),
        company_name: getTranslation('staffClientDocumentRequest.testImporterCompany'),
        commercial_number: getTranslation('staffClientDocumentRequest.testCommercialNumber'),
        activity_type: getTranslation('staffClientDocumentRequest.testActivityType'),
        address: getTranslation('staffClientDocumentRequest.testImporterAddress'),
        phone_number: '+218-21-1234567',
        email: getTranslation('staffClientDocumentRequest.testImporterEmail'),
        identity_number: '1234567890123456',
        mobile_number: '987654321',
        company_name_en: getTranslation('staffClientDocumentRequest.testCompanyNameEn'),
        quantity: 100,
        item_cost: 100000,
        for_official_use: getTranslation('staffClientDocumentRequest.testOfficialUse'),
        country_producer: getTranslation('staffClientDocumentRequest.testCountryProducer'),
        standard_of_origin: getTranslation('staffClientDocumentRequest.testStandardOfOrigin'),
      }]
    }));

    // Fill Free Trade specific data
    if (selectedRequestType?.id === 2) {
      setForeignCostItems([
        {
          id: '1',
          description: getTranslation('staffClientDocumentRequest.testRawMaterials'),
          quantity: 50,
          value: 25000
        },
        {
          id: '2',
          description: getTranslation('staffClientDocumentRequest.testProductionEquipment'),
          quantity: 5,
          value: 15000
        },
        {
          id: '3',
          description: getTranslation('staffClientDocumentRequest.testTransportServices'),
          quantity: 1,
          value: 5000
        }
      ]);

      setFreeTradeExtraData({
        total_value_text: getTranslation('staffClientDocumentRequest.testDescription'),
        total_value: 100000,
        origin_declaration: getTranslation('staffClientDocumentRequest.testOriginDeclaration'),
        value_added_percentage: '75%',
        issue_place: currentBranch?.name || getTranslation('staffClientDocumentRequest.testCountryProducer'),
        issue_date: '2024-01-20',
        certifying_authority: getTranslation('staffClientDocumentRequest.testCertifyingAuthority'),
        goods_origin: getTranslation('staffClientDocumentRequest.testCountryProducer'),
        foreign_revenue_quantity: '25',
        foreign_revenue_value: '15000'
      });

      // Mark all Free Trade fields as touched
      const allFreeTradeFields = ['total_value_text', 'origin_declaration', 'value_added_percentage', 'issue_date', 'certifying_authority', 'goods_origin', 'foreign_revenue_quantity', 'foreign_revenue_value'];
      const touchedFields = allFreeTradeFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
      setFreeTradeTouched(prev => ({ ...prev, ...touchedFields }));
    }

    // Mark all basic fields as touched
    setTouched({
      title: true,
      description: true,
      exporter_name: true,
      for_official_use: true,
      mobile_number: true,
      identity_number: true,
      country_producer: true,
      standard_of_origin: true,
      invoice_number: true,
      invoice_date: true,
      number_of_parcel: true,
      transport_details: true,
      activity_type: true,
      signs: true,
      weight: true,
      net_weight: true,
      quantity: true,
      item_cost: true,
      company_name: true
    });

    toast.success(getTranslation('staffClientDocumentRequest.testDataFilled'));
  };

  const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentRequest(prev => {
      const newRequest = { ...prev };

      // Handle direct fields of documentRequest
      if (['title', 'description', 'exporter_name'].includes(name)) {
        newRequest[name as 'title' | 'description' | 'exporter_name'] = value;
        if (user?.branchId) {
          newRequest.branch_id = user.branchId;
        }
      } else {
        // Handle request_details fields
        const newDetails = [...newRequest.request_details];
        if (newDetails[0]) {
          const detailToUpdate = { ...newDetails[0] };
          if (['number_of_parcel', 'weight', 'net_weight', 'value', 'quantity', 'item_cost'].includes(name)) {
            detailToUpdate[name as 'number_of_parcel' | 'weight' | 'net_weight' | 'value' | 'quantity' | 'item_cost'] = value === '' ? 0 : Number(value);
          } else {
            detailToUpdate[name as keyof RequestDetail] = value;
          }
          newDetails[0] = detailToUpdate;
          newRequest.request_details = newDetails;
        }
      }
      return newRequest;
    });
  }, [user]);

  const requestTypeOptions = Array.isArray(requestTypes) ? requestTypes?.map(rt => ({
    value: rt.id,
    label: `${rt.name}`
  })) : [];

  const clientOptions = Array.isArray(clients) ? clients?.map(client => ({
    value: client.id,
    label: `${client.nameEn || client.firstName + ' ' + client.lastName} (${client.email})`
  })) : [];

  const isFormValid = () => {
    if (selectedRequestType == null) return false;

    // COMESA Certificate specific validation (id: 1)
    if (selectedRequestType.id === 1) {
      // Check basic required fields for COMESA
      const { title, description, exporter_name } = documentRequest;
      if (!title || !description || !exporter_name) return false;

      // Check request_details required fields for COMESA
      const detail = documentRequest.request_details[0];
      if (!detail.for_official_use ||
        !detail.mobile_number ||
        !detail.identity_number ||
        !detail.country_producer ||
        !detail.standard_of_origin ||
        !detail.invoice_number ||
        !detail.invoice_date ||
        detail.number_of_parcel <= 0 ||
        !detail.transport_details) {
        return false;
      }

      // Check mobile number format (only digits)
      if (!/^\d+$/.test(detail.mobile_number)) {
        return false;
      }

      // Check minimum length requirements
      if (title?.length <= 6 ||
        description?.length <= 10 ||
        exporter_name?.length <= 6 ||
        detail.for_official_use?.length <= 6 ||
        detail.transport_details?.length <= 5) {
        return false;
      }

      // Check goods list for COMESA
      if (goods?.length === 0) {
        return false;
      }

      const hasInvalidGoods = goods.some(good =>
        !good.signs?.trim() ||
        !good.activity_type?.trim() ||
        !good.standard_of_origin?.trim() ||
        good.weight <= 0 ||
        good.net_weight <= 0 ||
        good.quantity <= 0 ||
        good.item_cost <= 0
      );
      if (hasInvalidGoods) {
        return false;
      }

      return true;
    }

    // Free Trade Certificate specific validation (id: 2)
    if (selectedRequestType.id === 2) {
      // Basic validation for required fields
      const { title, description, exporter_name } = documentRequest;
      if (!title || !exporter_name) return false;

      // Check if at least one foreign cost item exists
      if (foreignCostItems?.length === 0) {
        return false;
      }

      // Check maximum limit for foreign cost items
      if (foreignCostItems?.length > 3) {
        return false;
      }

      // Check if all foreign cost items have valid data
      const hasInvalidForeignItems = foreignCostItems.some(item =>
        !item.description.trim() || item.quantity <= 0 || item.value <= 0
      );
      if (hasInvalidForeignItems) {
        return false;
      }

      // Check required free trade extra data
      const requiredFreeTradeFields = ['total_value_text', 'origin_declaration', 'value_added_percentage', 'issue_date', 'certifying_authority', 'goods_origin'];
      const hasMissingFreeTradeFields = requiredFreeTradeFields.some(field =>
        !freeTradeExtraData[field] || freeTradeExtraData[field].trim() === ''
      );
      if (hasMissingFreeTradeFields) {
        return false;
      }
    }

    // Free Trade Certificate specific validation (id: 6)
    if (selectedRequestType.id === 6) {
      // Basic validation for required fields
      const { title, description, exporter_name } = documentRequest;
      if (!title || !description || !exporter_name) return false;

      // Check request_details required fields for Free Trade
      const detail = documentRequest.request_details[0];
      if (!detail.for_official_use ||
        !detail.mobile_number ||
        !detail.identity_number ||
        !detail.country_producer ||
        !detail.standard_of_origin ||
        !detail.invoice_number ||
        !detail.invoice_date ||
        detail.number_of_parcel <= 0 ||
        detail.item_cost <= 0 ||
        !detail.transport_details) {
        return false;
      }

      // Check mobile number format (only digits)
      if (!/^\d+$/.test(detail.mobile_number)) {
        return false;
      }

      // Check minimum length requirements
      if (title?.length <= 6 ||
        description?.length <= 10 ||
        exporter_name?.length <= 6 ||
        detail.for_official_use?.length <= 6 ||
        detail.transport_details?.length <= 5) {
        return false;
      }

      // Check goods list for Free Trade
      if (goods?.length === 0) {
        return false;
      }

      const hasInvalidGoods = goods.some(good =>
        !good.signs?.trim() ||
        !good.activity_type?.trim() ||
        !good.standard_of_origin?.trim() ||
        good.weight <= 0 ||
        good.net_weight <= 0 ||
        good.quantity <= 0 ||
        good.item_cost <= 0
      );
      if (hasInvalidGoods) {
        return false;
      }

      return true;
    }

    // For other request types, use basic validation
    const { title, description, exporter_name } = documentRequest;
    if (!title || !exporter_name) return false;

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Starting certificate creation process...');

    // Mark all Free Trade fields as touched for validation display
    if (selectedRequestType?.id === 2) {
      const allFreeTradeFields = ['total_value_text', 'origin_declaration', 'value_added_percentage', 'issue_date', 'certifying_authority', 'goods_origin'];
      const touchedFields = allFreeTradeFields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
      setFreeTradeTouched(prev => ({ ...prev, ...touchedFields }));
    }

    if (!isFormValid()) {
      console.warn('⚠️ Form validation failed - missing required fields');

      // Specific validation error messages
      let errorMessage = getTranslation('staffClientDocumentRequest.fillAllRequiredFields');

      if (selectedRequestType?.id === 2) {
        if (foreignCostItems?.length === 0) {
          errorMessage = getTranslation('staffClientDocumentRequest.addAtLeastOneItem');
        } else if (foreignCostItems?.length > 3) {
          errorMessage = getTranslation('staffClientDocumentRequest.maxThreeItems');
        } else if (foreignCostItems.some(item => !item.description.trim() || item.quantity <= 0 || item.value <= 0)) {
          errorMessage = getTranslation('staffClientDocumentRequest.checkForeignItemsData');
        } else {
          const missingFields = ['total_value_text', 'origin_declaration', 'value_added_percentage', 'issue_date', 'certifying_authority', 'goods_origin'].filter(field =>
            !freeTradeExtraData[field] || freeTradeExtraData[field].trim() === ''
          );
          if (missingFields?.length > 0) {
            errorMessage = `${getTranslation('staffClientDocumentRequest.fillFollowingFields')} ${missingFields.join(', ')}`;
          }
        }
      } else if (selectedRequestType?.id === 1) {
        if (goods?.length === 0) {
          errorMessage = getTranslation('staffClientDocumentRequest.addAtLeastOneGood');
        } else {
          errorMessage = getTranslation('staffClientDocumentRequest.checkGoodsData');
        }
      }

      toast.error(errorMessage);
      return;
    }

    console.log('✅ Form validation passed');
    setLoading(true);

    const token = getCurrentUser()?.accessToken;
    if (!token) {
      console.error('❌ No authentication token found');
      toast.error(getTranslation('common.errors.authRequired', 'Authentication required. Please login again.'));
      setLoading(false);
      return;
    }

    console.log('✅ Authentication token found');

    // Validate required data
    if (!user?.branchId && !currentBranch?.id) {
      console.error('❌ No valid branch ID found');
      toast.error(getTranslation('staffClientDocumentRequest.branchIdNotFound'));
      setLoading(false);
      return;
    }

    const requestPayload = {
      title: documentRequest.title,
      description: documentRequest.description,
      exporter_name: documentRequest.exporter_name,
      client_id: selectedClient ? parseInt(selectedClient, 10) : 0,
      request_type_id: selectedRequestType?.id || 0,
      request_details: (selectedRequestType?.id === 1 ? goods : documentRequest.request_details)?.map(detail => ({
        client_name: selectedRequestType?.id === 1 ? '' : (detail.client_name || ''),
        transfer_detail: selectedRequestType?.id === 1 ? '' : (detail.transfer_detail || ''),
        signs: detail.signs || '',
        number_of_parcel: Number(detail.number_of_parcel || 0),
        description: selectedRequestType?.id === 1 ? '' : (detail.description || ''),
        weight: Number(detail.weight || 0),
        net_weight: Number(detail.net_weight || 0),
        client_id: selectedClient ? parseInt(selectedClient, 10) : 0,
        user_id: user?.id ? parseInt(user.id, 10) : 0,
        invoice_number: selectedRequestType?.id === 1 ? documentRequest.request_details[0].invoice_number || '' : (detail.invoice_number || ''),
        invoice_date: selectedRequestType?.id === 1 ?
          (documentRequest.request_details[0].invoice_date ? new Date(documentRequest.request_details[0].invoice_date).toISOString() : new Date().toISOString()) :
          (detail.invoice_date ? new Date(detail.invoice_date).toISOString() : new Date().toISOString()),
        company_name: selectedRequestType?.id === 1 ? '' : (detail.company_name || ''),
        commerical_number: selectedRequestType?.id === 1 ? '' : (detail.commercial_number || ''),
        activity_type: detail.activity_type || '',
        address: selectedRequestType?.id === 1 ? '' : (detail.address || ''),
        phone_number: selectedRequestType?.id === 1 ? '' : (detail.phone_number || ''),
        email: selectedRequestType?.id === 1 ? '' : (detail.email || ''),
        identity_number: selectedRequestType?.id === 1 ? documentRequest.request_details[0].identity_number || '' : (detail.identity_number || ''),
        mobile_number: selectedRequestType?.id === 1 ? documentRequest.request_details[0].mobile_number || '' : (detail.mobile_number || ''),
        for_official_use: selectedRequestType?.id === 1 ? documentRequest.request_details[0].for_official_use || '' : (detail.for_official_use || ''),
        country_producer: selectedRequestType?.id === 1 ? documentRequest.request_details[0].country_producer || '' : (detail.country_producer || ''),
        standard_of_origin: detail.standard_of_origin || '',
        quantity: Number(detail.quantity || 0),
        item_cost: Number(detail.item_cost || 0),
        exporter_name: selectedRequestType?.id === 1 ? documentRequest.exporter_name || '' : (detail.exporter_name || ''),
        // Free Trade specific fields
        extra: selectedRequestType?.id === 2 ? JSON.stringify({
          ...freeTradeExtraData,
          quantity: detail.quantity || 0,
          item_cost: detail.item_cost || 0,
          transport_details: documentRequest.request_details[0].transport_details || ''
        }) : selectedRequestType?.id === 1 ? JSON.stringify({
          transport_details: documentRequest.request_details[0].transport_details || ''
        }) : '{}',
        foreign_items_cost: selectedRequestType?.id === 2 ? JSON.stringify([
          ...foreignCostItems,
          ...(Number(freeTradeExtraData.foreign_revenue_quantity) > 0 || Number(freeTradeExtraData.foreign_revenue_value) > 0 ? [{
            id: 'foreign_revenue',
            description: getTranslation('staffClientDocumentRequest.foreignRevenue'),
            quantity: Number(freeTradeExtraData.foreign_revenue_quantity) || 0,
            value: Number(freeTradeExtraData.foreign_revenue_value) || 0
          }] : [])
        ]) : '[]',
      })),
    };

    // Detailed logging for debugging
    console.log('=== CREATE CERTIFICATE REQUEST DEBUG ===');
    console.log('📋 Request Type:', selectedRequestType?.title, '(ID:', selectedRequestType?.id, ')');
    console.log('👤 Selected Client:', selectedClient);
    console.log('📦 Quantity:', documentRequest.request_details[0].quantity);
    console.log('💰 Item Cost:', documentRequest.request_details[0].item_cost);
    console.log('📋 Extra Data:', freeTradeExtraData);
    console.log('🏢 Current Branch:', currentBranch);
    console.log('📄 Document Request Data:');
    console.log('  - Title:', documentRequest.title);
    console.log('  - Description:', documentRequest.description);
    console.log('  - Exporter Name:', documentRequest.exporter_name);
    console.log('  - Request Details Count:', documentRequest.request_details?.length);

    if (selectedRequestType?.id === 1) {
      console.log('🔄 COMESA CERTIFICATE DATA:');
      console.log('  - Exporter Name in Request Details:', documentRequest.exporter_name);
      console.log('  - Goods Count:', goods?.length);
      goods.forEach((good, index) => {
        console.log(`    Good ${index + 1}:`, {
          signs: good.signs,
          activity_type: good.activity_type,
          standard_of_origin: good.standard_of_origin,
          weight: good.weight,
          net_weight: good.net_weight,
          quantity: good.quantity,
          item_cost: good.item_cost
        });
      });
    }

    if (selectedRequestType?.id === 2) {
      console.log('🔄 FREE TRADE CERTIFICATE DATA:');
      console.log('  - Foreign Cost Items Count:', foreignCostItems?.length);
      foreignCostItems.forEach((item, index) => {
        console.log(`    Item ${index + 1}:`, {
          description: item.description,
          quantity: item.quantity,
          value: item.value
        });
      });
      console.log('  - Foreign Cost Items (JSON String):', JSON.stringify(foreignCostItems));
      console.log('  - Free Trade Extra Data:', freeTradeExtraData);
      console.log('  - Free Trade Extra Data (JSON String):', JSON.stringify(freeTradeExtraData));
      console.log('  - Issue Place (Branch Name):', currentBranch?.name);
      console.log('  - Issue Date:', freeTradeExtraData.issue_date);
    }

    if (selectedRequestType?.id === 1) {
      console.log('📦 COMESA CERTIFICATE DATA:');
      console.log('  - Goods Count:', goods?.length);
      goods.forEach((good, index) => {
        console.log(`    Good ${index + 1}:`, {
          description: good.description,
          weight: good.weight,
          quantity: good.quantity,
          item_cost: good.item_cost
        });
      });
    }

    console.log('📤 Final Payload to Backend:');
    console.log(JSON.stringify(requestPayload, null, 2));

    // Log Free Trade specific data separately for verification
    if (selectedRequestType?.id === 2) {
      console.log('🔄 FREE TRADE DATA VERIFICATION:');
      console.log('  - Extra Data (JSON String):', JSON.stringify(freeTradeExtraData));
      console.log('  - Foreign Items Cost (JSON String):', JSON.stringify(foreignCostItems));
      console.log('  - Extra in Request Details:', requestPayload.request_details[0]?.extra);
      console.log('  - Foreign Items Cost in Request Details:', requestPayload.request_details[0]?.foreign_items_cost);

      // Parse and verify quantity and item_cost in extra
      try {
        const extraData = JSON.parse(requestPayload.request_details[0]?.extra || '{}');
        console.log('📦 QUANTITY & ITEM COST VERIFICATION:');
        console.log('  - Quantity in Extra:', extraData.quantity);
        console.log('  - Item Cost in Extra:', extraData.item_cost);
        console.log('  - Total Value in Extra:', extraData.total_value);
        console.log('  - Foreign Revenue Quantity:', extraData.foreign_revenue_quantity);
        console.log('  - Foreign Revenue Value:', extraData.foreign_revenue_value);
      } catch (error) {
        console.error('Error parsing extra data for verification:', error);
      }

      // Parse and verify foreign_items_cost
      try {
        const foreignItemsData = JSON.parse(requestPayload.request_details[0]?.foreign_items_cost || '[]');
        console.log('🌍 FOREIGN ITEMS COST VERIFICATION:');
        console.log('  - Foreign Items Count:', foreignItemsData?.length);
        console.log('  - Foreign Items:', foreignItemsData);
        const foreignRevenueItem = foreignItemsData.find(item => item.id === 'foreign_revenue');
        if (foreignRevenueItem) {
          console.log('  - Foreign Revenue Item:', foreignRevenueItem);
        }
      } catch (error) {
        console.error('Error parsing foreign_items_cost for verification:', error);
      }
    }

    // Additional validation logs
    console.log('🔍 Validation Checks:');
    console.log('  - Request Type ID:', requestPayload.request_type_id);
    console.log('  - Client ID:', requestPayload.client_id);
    console.log('  - Request Details Length:', requestPayload.request_details?.length);
    console.log('  - First Detail Invoice Date:', requestPayload.request_details[0]?.invoice_date);

    console.log('=== END DEBUG ===');

    try {
      const response = await createRequest(requestPayload, token);

      if (response.success) {
        console.log('✅ Certificate created successfully!');
        console.log('Response:', response);
        setTouched({});
        toast.success(getTranslation('staffPages.forms.requestCreatedSuccess', 'Document request created successfully!'));
        // Reset form and state
        setSelectedClient('');
        setSelectedRequestType(null);
        setDocumentRequest({
          title: '',
          description: '',
          exporter_name: '',
          branch_id: 0,
          request_type_id: null,
          request_details: [{
            client_name: '',
            transfer_detail: null,
            signs: null,
            number_of_parcel: 0,
            description: null,
            weight: 0,
            client_id: null,
            user_id: 0,
            net_weight: 0,
            invoice_number: '',
            invoice_date: null,
            company_name: null,
            commercial_number: null,
            activity_type: null,
            address: null,
            phone_number: null,
            email: null,
            identity_number: '',
            mobile_number: '',
            company_name_en: null,
            quantity: 0,
            item_cost: 0,
            for_official_use: '',
            country_producer: '',
            standard_of_origin: '',
          }],
        });
        setGoods([]);
        // Reset Free Trade specific data
        setForeignCostItems([]);
        setFreeTradeExtraData({});
      } else {

        toast.error(getTranslation('staffPages.forms.requestCreateError', 'Failed to create document request'))
        // (response.message || getTranslation('common.errors.unknown', 'Unknown error')));
      }
    } catch (error: any) {
      console.error('Error creating document request:', error);
      toast.error(getTranslation('staffPages.forms.requestCreateError', 'Failed to create document request'));
      // (error?.message || getTranslation('common.errors.unknown', 'Unknown error')));
    } finally {
      setLoading(false);
    }
  };

  // ... (rest of the code remains the same)
  // Helper function to get translation with better fallback handling
  // const getTranslation = (key: string, fallback: string): string => {
  //   const translation = t(key);
  //   return translation === key ? fallback : translation;
  // };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{getTranslation('staffClientDocumentRequest.pageTitle')}</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card cardTitle={getTranslation('staffClientDocumentRequest.pageTitle')}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getTranslation('staffPages.forms.clientSelection', 'Select Client')}
                  </label>
                  {loadingClients ? (
                    <div className="mt-2 text-sm text-gray-500">{getTranslation('common.loading', 'Loading...')}</div>
                  ) : (
                    <CustomSelect
                      options={clientOptions}
                      value={selectedClient}
                      onChange={setSelectedClient}
                      placeholder={getTranslation('staffPages.forms.selectClientPlaceholder', 'Select a client')}
                      className="mt-1 w-full"
                    />
                  )}
                </div>

                {/* Request Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {getTranslation('staffPages.forms.requestType', 'Request Type')}
                  </label>
                  {loadingRequestTypes ? (
                    <div className="mt-2 text-sm text-gray-500">{getTranslation('common.loading', 'Loading...')}</div>
                  ) : (
                    <CustomSelect
                      options={requestTypeOptions}
                      value={selectedRequestType?.id}
                      onChange={(value) => setSelectedRequestType(value ? { id: parseInt(value), title: requestTypeOptions.find(rt => rt.value === value)?.label } : null)}
                      placeholder={selectedRequestType ? selectedRequestType.title : getTranslation('staffPages.forms.selectRequestTypePlaceholder', 'Select request type')}
                      className="mt-1 w-full"
                    />
                  )}
                </div>

                {/* Constant Fields Section */}
                {selectedRequestType && (
                  <div className="border p-4 rounded-md space-y-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {getTranslation('staffClientDocumentRequest.requestDetails')}
                      </h3>
                      <button
                        type="button"
                        onClick={fillAllFieldsWithTestData}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm hidden"

                      >
                        {getTranslation('staffClientDocumentRequest.fillTestData')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Source Name -> title */}
                      <FormInputField
                        name="title"
                        minLength={7}
                        label={getTranslation('staffClientDocumentRequest.sourceName')}
                        value={documentRequest.title}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, title: true }));

                        }}
                        required
                        error={touched?.title ? documentRequest.title?.length > 6 ? undefined : getTranslation('staffClientDocumentRequest.bigThan6LettersMsg') : undefined}
                      />

                      {/* Description field */}                      
                      <FormInputField
                        minLength={10}
                        name="description"
                        label={selectedRequestType?.id == 6 ? getTranslation('staffClientDocumentRequest.transportDetails') : selectedRequestType?.id == 7 ? getTranslation('staffClientDocumentRequest.shippingDetails') : selectedRequestType?.id == 1 ? getTranslation('staffClientDocumentRequest.description') : getTranslation('staffClientDocumentRequest.description')}
                        value={documentRequest.description}
                        required={true}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, description: true }));
                        }}
                        error={touched.description ? documentRequest.description?.length > 10 ? undefined : getTranslation('staffClientDocumentRequest.bigThan10LettersMsg') : undefined}
                      />
                      <FormInputField
                        minLength={7}
                        name="for_official_use"
                        label={getTranslation('staffClientDocumentRequest.forOfficialUse')}
                        value={documentRequest.request_details[0].for_official_use}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, for_official_use: true }))
                        }
                        }
                        required
                        error={touched.for_official_use ?
                          documentRequest.request_details[0].for_official_use?.length > 6 ? undefined : getTranslation('staffClientDocumentRequest.bigThan6LettersMsg') : undefined}
                      />
                      {/* Export Name field */}
                      <FormInputField
                        minLength={7}
                        name="exporter_name"
                        label={getTranslation('staffClientDocumentRequest.exportName')}
                        value={documentRequest.exporter_name}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, exporter_name: true }))
                        }

                        }
                        required
                        error={touched.exporter_name ? documentRequest.exporter_name?.length > 6 ? undefined : getTranslation('staffClientDocumentRequest.bigThan6LettersMsg') : undefined}
                      />
                      {/* Mobile Number */}
                      <FormInputField
                        name="mobile_number"
                        label={getTranslation('staffClientDocumentRequest.mobileNumber')}
                        value={documentRequest.request_details[0].mobile_number}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, mobile_number: true }))
                        }}
                        required
                        error={touched.mobile_number ?
                          !/^\d*$/.test(documentRequest.request_details[0].mobile_number)
                            ? getTranslation('staffClientDocumentRequest.errorThereIsletter')
                            : documentRequest.request_details[0].mobile_number.startsWith("-")
                              ? getTranslation('staffClientDocumentRequest.phoneNegativeError')
                              : undefined
                          : undefined
                        } />

                      {/* Identity Number */}
                      <FormInputField
                        name="identity_number"
                        label={getTranslation('staffClientDocumentRequest.identityNumber')}
                        value={documentRequest.request_details[0].identity_number}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, identity_number: true }))
                        }}
                        required
                        error={touched.identity_number ?
                          documentRequest?.request_details[0]?.identity_number ? undefined : getTranslation('staffClientDocumentRequest.required') : undefined}
                      />

                      <FormInputField
                        name="country_producer"
                        label={getTranslation('staffClientDocumentRequest.countryProducer')}
                        value={documentRequest.request_details[0].country_producer}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, country_producer: true }))
                        }}
                        required
                        error={touched.country_producer ?
                          documentRequest?.request_details[0]?.country_producer ? undefined : getTranslation('staffClientDocumentRequest.required') : undefined}
                      />

                      <FormInputField
                        name="standard_of_origin"
                        label={getTranslation('staffClientDocumentRequest.standardOfOrigin')}
                        value={documentRequest.request_details[0].standard_of_origin}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, standard_of_origin: true }))
                        }}
                        required
                        error={touched.standard_of_origin ?
                          documentRequest?.request_details[0]?.standard_of_origin ? undefined : getTranslation('staffClientDocumentRequest.required') : undefined}
                      />

                      {/* Invoice Number */}
                      <FormInputField
                        name="invoice_number"
                        label={getTranslation('staffClientDocumentRequest.invoiceNumber')}
                        value={documentRequest.request_details[0].invoice_number}
                        required={true}
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, invoice_number: true }))
                        }}
                        error={touched.invoice_number ?
                          documentRequest?.request_details[0]?.invoice_number ? undefined : getTranslation('staffClientDocumentRequest.required') : undefined}
                      />

                      {/* Invoice Date */}
                      <FormDateField
                        name="invoice_date"
                        label={getTranslation('staffClientDocumentRequest.invoiceDate')}
                        value={documentRequest.request_details[0].invoice_date}
                        required
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, invoice_date: true }))
                        }}
                        error={touched.invoice_date ?
                          documentRequest.request_details[0].invoice_date ? undefined : getTranslation('staffClientDocumentRequest.required')
                          : undefined
                        }
                      />

                      {/* Number of Parcels */}
                      <FormInputField
                        min={0}
                        name="number_of_parcel"
                        label={getTranslation('staffClientDocumentRequest.numberOfParcels')}
                        value={documentRequest.request_details[0].number_of_parcel === 0 ? '' : documentRequest.request_details[0].number_of_parcel.toString()}
                        type="number"
                        required
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, number_of_parcel: true }))
                        }}
                        error={touched.number_of_parcel
                          ? documentRequest.request_details[0].number_of_parcel > 0 ? undefined : getTranslation('staffClientDocumentRequest.required')
                          : undefined
                        }
                      />

                      {/* Transport Details */}
                      <FormInputField
                        name="transport_details"
                        label={getTranslation('staffClientDocumentRequest.transportDetails')}
                        value={documentRequest.request_details[0].transport_details || ''}
                        required
                        onChange={(e) => {
                          handleInputChange(e);
                          setTouched((prev) => ({ ...prev, transport_details: true }))
                        }}
                        error={touched.transport_details ?
                          documentRequest.request_details[0].transport_details && documentRequest.request_details[0].transport_details?.length > 5 ? undefined : getTranslation('staffClientDocumentRequest.bigThan6LettersMsg') : undefined}
                      />
                    </div>
                  </div>
                )}

                {/* Free Trade Certificate Sections */}
                {selectedRequestType?.id === 2 && (
                  <div className="space-y-6">
                    {/* Green Section - Existing inputs without changes */}
                    <div className="border p-4 rounded-md space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInputField
                          name="activity_type"
                          label={getTranslation('staffClientDocumentRequest.goodsType')}
                          value={documentRequest.request_details[0].activity_type || ''}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTouched((prev) => ({ ...prev, activity_type: true }))
                          }}
                          required
                        />
                        <FormInputField
                          name="signs"
                          label={getTranslation('staffClientDocumentRequest.parcelDetails')}
                          value={documentRequest.request_details[0].signs || ''}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTouched((prev) => ({ ...prev, signs: true }))
                          }}
                          required
                        />
                        <FormInputField
                          name="weight"
                          label={getTranslation('staffClientDocumentRequest.weight')}
                          value={documentRequest.request_details[0].weight === 0 ? '' : documentRequest.request_details[0].weight.toString()}
                          type="number"
                          min={0}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTouched((prev) => ({ ...prev, weight: true }))
                          }}
                          required
                        />
                        <FormInputField
                          name="net_weight"
                          label={getTranslation('staffClientDocumentRequest.netWeight')}
                          value={documentRequest.request_details[0].net_weight === 0 ? '' : documentRequest.request_details[0].net_weight.toString()}
                          type="number"
                          min={0}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTouched((prev) => ({ ...prev, net_weight: true }))
                          }}
                          required
                        />
                        <FormInputField
                          name="quantity"
                          label={getTranslation('staffClientDocumentRequest.quantity')}
                          value={documentRequest.request_details[0].quantity === 0 ? '' : documentRequest.request_details[0].quantity.toString()}
                          type="number"
                          min={0}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTouched((prev) => ({ ...prev, quantity: true }))
                          }}
                          required
                        />
                        <FormInputField
                          name="item_cost"
                          label={getTranslation('staffClientDocumentRequest.localValue')}
                          value={(() => {
                            const cost = documentRequest.request_details[0].item_cost;
                            const displayValue = cost === 0 ? '' : cost.toString();
                            console.log('item_cost display value:', displayValue, 'original cost:', cost);
                            return displayValue;
                          })()}
                          type="number"
                          min={0}
                          step="0.01"
                          onChange={(e) => {
                            // Only allow numbers and decimal point
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            console.log('item_cost onChange - original value:', e.target.value, 'cleaned value:', value);

                            // Update the state directly for item_cost
                            setDocumentRequest(prev => {
                              const newRequest = { ...prev };
                              const newDetails = [...newRequest.request_details];
                              if (newDetails[0]) {
                                const detailToUpdate = { ...newDetails[0] };
                                detailToUpdate.item_cost = value === '' ? 0 : Number(value);
                                newDetails[0] = detailToUpdate;
                                newRequest.request_details = newDetails;
                                console.log('item_cost updated to:', detailToUpdate.item_cost);
                              }
                              return newRequest;
                            });

                            setTouched((prev) => ({ ...prev, item_cost: true }))
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Yellow Section - Modified inputs for Free Trade */}
                    <div className="border p-4 rounded-md space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInputField
                          name="company_name"
                          label={getTranslation('staffClientDocumentRequest.producerCompany')}
                          value={documentRequest.request_details[0].company_name || ''}
                          onChange={(e) => {
                            handleInputChange(e);
                            setTouched((prev) => ({ ...prev, company_name: true }))
                          }}
                          required
                        />
                      </div>
                    </div>

                    {/* Red Section - New inputs for Free Trade */}
                    <div className="border p-4 rounded-md space-y-4">

                      {/* Foreign Cost Items */}
                      <div className={`space-y-4 p-4 border rounded-md ${foreignCostItems?.length === 0 ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-300'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">
                              {getTranslation('staffClientDocumentRequest.foreignCostItems')}
                              {foreignCostItems?.length === 0 && (
                                <span className="text-red-500 text-sm mr-2">{getTranslation('staffClientDocumentRequest.atLeastOneItemRequired')}</span>
                              )}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {getTranslation('staffClientDocumentRequest.maxThreeItemsLimit')} ({foreignCostItems?.length}/3)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={addForeignCostItem}
                            disabled={foreignCostItems?.length >= 3}
                            className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${foreignCostItems?.length >= 3
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500'
                              }`}
                          >
                            {foreignCostItems?.length >= 3 ? getTranslation('staffClientDocumentRequest.maxItemsReached') : getTranslation('staffClientDocumentRequest.addItem')}
                          </button>
                        </div>

                        {foreignCostItems?.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">{getTranslation('staffClientDocumentRequest.noForeignItemsAdded')}</p>
                            <p className="text-xs mt-1">{getTranslation('staffClientDocumentRequest.clickAddItem')}</p>
                          </div>
                        )}

                        {foreignCostItems?.map((item, index) => (
                          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border border-gray-300 rounded-md bg-white dark:bg-gray-800">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getTranslation('staffClientDocumentRequest.foreignCostItems')}
                              </label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateForeignCostItem(item.id, 'description', e.target.value)}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder={getTranslation('staffClientDocumentRequest.itemDescriptionPlaceholder')}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {getTranslation('staffClientDocumentRequest.quantity')}
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => updateForeignCostItem(item.id, 'quantity', Number(e.target.value))}
                                className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div className="flex items-end">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {getTranslation('staffClientDocumentRequest.localValue')}
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.value}
                                  onChange={(e) => updateForeignCostItem(item.id, 'value', Number(e.target.value))}
                                  className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeForeignCostItem(item.id)}
                                className="ml-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                {getTranslation('staffClientDocumentRequest.delete')}
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Foreign Revenue Item */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 border border-blue-300 rounded-md bg-blue-50 dark:bg-blue-900/20">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getTranslation('staffClientDocumentRequest.foreignRevenue')}
                            </label>
                            <input
                              type="text"
                              value={getTranslation('staffClientDocumentRequest.foreignRevenue')}
                              readOnly
                              className="mt-1 w-full p-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getTranslation('staffClientDocumentRequest.quantity')}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={freeTradeExtraData.foreign_revenue_quantity || 0}
                              onChange={(e) => handleFreeTradeExtraDataChange('foreign_revenue_quantity', e.target.value)}
                              className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              {getTranslation('staffClientDocumentRequest.localValue')}
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={freeTradeExtraData.foreign_revenue_value || 0}
                              onChange={(e) => handleFreeTradeExtraDataChange('foreign_revenue_value', e.target.value)}
                              className="mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional Free Trade Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInputField
                          name="total_value_text"
                          label={getTranslation('staffClientDocumentRequest.totalValueText')}
                          value={freeTradeExtraData.total_value_text || ''}
                          onChange={(e) => handleFreeTradeExtraDataChange('total_value_text', e.target.value)}
                          required
                          error={freeTradeTouched.total_value_text && !freeTradeExtraData.total_value_text?.trim() ? getTranslation('staffClientDocumentRequest.fieldRequired') : undefined}
                        />
                        <FormInputField
                          name="origin_declaration"
                          label={getTranslation('staffClientDocumentRequest.originDeclaration')}
                          value={freeTradeExtraData.origin_declaration || ''}
                          onChange={(e) => handleFreeTradeExtraDataChange('origin_declaration', e.target.value)}
                          required
                          error={freeTradeTouched.origin_declaration && !freeTradeExtraData.origin_declaration?.trim() ? getTranslation('staffClientDocumentRequest.fieldRequired') : undefined}
                        />
                        <FormInputField
                          name="value_added_percentage"
                          label={getTranslation('staffClientDocumentRequest.valueAddedPercentage')}
                          value={freeTradeExtraData.value_added_percentage || ''}
                          onChange={(e) => handleFreeTradeExtraDataChange('value_added_percentage', e.target.value)}
                          required
                          error={freeTradeTouched.value_added_percentage && !freeTradeExtraData.value_added_percentage?.trim() ? getTranslation('staffClientDocumentRequest.fieldRequired') : undefined}
                        />
                        <FormInputField
                          name="issue_place"
                          label={getTranslation('staffClientDocumentRequest.issuePlace')}
                          value={freeTradeExtraData.issue_place || currentBranch?.name || ''}
                          onChange={(e) => handleFreeTradeExtraDataChange('issue_place', e.target.value)}
                          required
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getTranslation('staffClientDocumentRequest.issueDate')} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={freeTradeExtraData.issue_date || ''}
                            onChange={(e) => handleFreeTradeExtraDataChange('issue_date', e.target.value)}
                            className={`mt-1 w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 ${freeTradeTouched.issue_date && !freeTradeExtraData.issue_date?.trim() ? 'border-red-500' : ''
                              }`}
                            required
                          />
                          {freeTradeTouched.issue_date && !freeTradeExtraData.issue_date?.trim() && (
                            <p className="mt-1 text-xs text-red-500">{getTranslation('staffClientDocumentRequest.fieldRequired')}</p>
                          )}
                        </div>
                        <FormInputField
                          name="certifying_authority"
                          label={getTranslation('staffClientDocumentRequest.certifyingAuthority')}
                          value={freeTradeExtraData.certifying_authority || ''}
                          onChange={(e) => handleFreeTradeExtraDataChange('certifying_authority', e.target.value)}
                          required
                          error={freeTradeTouched.certifying_authority && !freeTradeExtraData.certifying_authority?.trim() ? getTranslation('staffClientDocumentRequest.fieldRequired') : undefined}
                        />
                        <FormInputField
                          name="goods_origin"
                          label={getTranslation('staffClientDocumentRequest.goodsOrigin')}
                          value={freeTradeExtraData.goods_origin || ''}
                          onChange={(e) => handleFreeTradeExtraDataChange('goods_origin', e.target.value)}
                          required
                          error={freeTradeTouched.goods_origin && !freeTradeExtraData.goods_origin?.trim() ? 'هذا الحقل مطلوب' : undefined}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequestType?.id === 1 && (
                <GoodsList goods={goods} setGoods={setGoods} />
              )}

              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full bg-brand-primary text-white py-3 rounded-lg hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                  disabled={!isFormValid() || loading}
                >
                  {loading ? getTranslation('staffPages.forms.submitting') : getTranslation('staffPages.forms.submitRequest')}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview Section */}
      </div>
    </div>
  );
};

export default StaffClientDocumentRequestPage;
