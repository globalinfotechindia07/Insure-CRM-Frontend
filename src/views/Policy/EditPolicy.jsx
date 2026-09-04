import React, { useEffect, useState, useMemo } from 'react';
import {
  Grid,
  TextField,
  Button,
  Typography,
  Card,
  IconButton,
  CardContent,
  FormControl,
  Switch,
  RadioGroup,
  Radio,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  Divider,
  Box,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { validateFormFields, formatApiErrorMessage, formatAmountWithCommas, parseAmount, POLICY_AMOUNT_FIELDS } from '../../utils/formValidation';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { get, put } from 'api/api';
const normalizeValStr = (val) => {
  if (val === null || val === undefined) return '';
  let str = String(val).trim();
  if (str.endsWith('%')) str = str.slice(0, -1).trim();
  return str.toLowerCase();
};

const resolveSelectValue = (options, savedVal, labelKeys = []) => {
  if (savedVal === null || savedVal === undefined || savedVal === '') return '';
  if (typeof savedVal === 'object' && savedVal._id) return String(savedVal._id);

  const targetStr = normalizeValStr(savedVal);
  if (!targetStr) return '';

  if (!options || !Array.isArray(options) || options.length === 0) {
    return String(savedVal);
  }

  // 1. Direct _id / id / code match (strict ID match)
  const directIdMatch = options.find((opt) => {
    if (!opt) return false;
    const optId = String(opt._id || opt.id || opt.code || '').trim().toLowerCase();
    return optId && optId === targetStr;
  });
  if (directIdMatch) return directIdMatch._id || directIdMatch.id || directIdMatch.code;

  // 2. Label / Value field match (e.g. value, name, rate)
  const labelMatch = options.find((opt) => {
    if (!opt) return false;
    const keysToCheck = labelKeys.length > 0 ? labelKeys : Object.keys(opt);
    return keysToCheck.some((key) => {
      const v = opt[key];
      if (v === undefined || v === null) return false;
      const normOptVal = normalizeValStr(v);
      return normOptVal && normOptVal === targetStr;
    });
  });
  if (labelMatch) return labelMatch._id || labelMatch.id || labelMatch.value || labelMatch.code;

  return String(savedVal);
};

const EditPolicy = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialState());
  const [errors, setErrors] = useState({});

  const [financialYearData, setFinancialYearData] = useState([]);
  const [gstData, setGstData] = useState([]);
  const [clientTypeValue, setClientTypeValue] = useState('retail');
  const [departmentValue, setDepartmentValue] = useState('');
  const [insCompanyData, setInsCompanyData] = useState([]);
  const [insDepartmentData, setInsDepartmentData] = useState([]);
  const [policyData, setPolicyData] = useState(null);

  const selectedDeptName = React.useMemo(() => {
    if (!departmentValue && policyData?.insDepartment) {
      const pDept = policyData.insDepartment;
      if (typeof pDept === 'object') return (pDept.insDepartment || pDept.name || '').toLowerCase().trim();
      return String(pDept).toLowerCase().trim();
    }
    if (!departmentValue) return '';
    if (typeof departmentValue === 'object') {
      return (departmentValue.insDepartment || departmentValue.name || '').toLowerCase().trim();
    }
    const selectedDept = insDepartmentData.find((d) => String(d._id) === String(departmentValue) || d.insDepartment?.toLowerCase().trim() === String(departmentValue).toLowerCase().trim());
    if (selectedDept) {
      return selectedDept.insDepartment?.toLowerCase().trim() || '';
    }
    return String(departmentValue).toLowerCase().trim();
  }, [insDepartmentData, departmentValue, policyData]);
  const [siteLocation, setSiteLocation] = useState('');
  const [brokerageValue, setBrokerageValue] = useState('brokerage');
  const [clientList, setClientList] = useState([]);
  const [filterByDocumentValue, setFilterByDocumentValue] = useState('');
  const [prefixData, setPrefixData] = useState([]);
  const [branchCodeData, setBranchCodeData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [subProductData, setSubProductData] = useState([]);
  const [riskCodeData, setRiskCodeData] = useState([]);
  const [addonData, setAddonData] = useState([]);
  const [brokerageRateData, setBrokerageRateData] = useState([]);
  const [endorsementData, setEndorsementData] = useState([]);
  const [showNominee, setShowNominee] = useState(false);
  const [showCoBrokerage, setShowCoBrokerage] = useState(false);
  const [customerGroupData, setCustomerGroupData] = useState([]);
  const [subCustomerGroupData, setSubCustomerGroupData] = useState([]);
  const [brokerNameData, setBrokerNameData] = useState([]);
  const [branchBrokerData, setBranchBrokerData] = useState([]);
  const [incotermsData, setIncotermsData] = useState([]);
  const [fuelTypeData, setFuelTypeData] = useState([]);
  const [branchNameId, setBranchNameId] = useState('');
  const [paymentModeData, setPaymentModeData] = useState([]);

  const [taxes, setTaxes] = useState({
    CGST: setForm.CGST,
    SGST: setForm.SGST,
    IGST: setForm.IGST,
    UGST: setForm.UGST
  });

  const handleFilterByDocumentChange = (e) => setFilterByDocumentValue(e.target.value);

  function initialState() {
    return {
      financialYear: '',
      clientType: '',
      retailCustomer: '',
      customerGroup: '',
      subCustomerGroup: '',
      checkSubGroup: '',
      branchCode: '',
      branchName: '',
      prefix: '',
      cutomerName: '',
      mobile: '',
      email: '',
      insurerName: '',
      gstNo: '',
      showNominee: false,
      nomineeName: '',
      nomineeRelation: '',
      nomineeContact: '',
      insDepartment: '',
      product: '',
      subProduct: '',
      insCompany: '',
      brokerName: '',
      branchBroker: '',
      tpPolicyDuration: '',
      tpStartDate: '',
      tpEndDate: '',
      tpPremium: '',
      tpGst: '',
      tpGstAmount: '',
      tpAmount: '',
      odPolicyDuration: '',
      odStartDate: '',
      odEndDate: '',
      odPremium: '',
      odGst: '',
      odGstAmount: '',
      odAmount: '',
      policyNumber: '',
      renewalDate: '',
      sumInsured: '',
      renewable: '',
      policyDuration: '',
      startDate: '',
      endDate: '',
      riskCode: '',
      otherAddon: '',
      terrirism: '',
      netPremium: '',
      gst: '',
      gstAmount: '',
      totalAmount: '',
      siteLocation: '',
      numberOfInstallments: '',
      occupation: '',
      retroActive: '',
      incoterms: '',
      marineClause: '',
      terrorism: '',
      permiumOtherThanTerrorism: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleSubModel: '',
      vehicleNumber: '',
      engineNumber: '',
      monthYearOfRegn: '',
      fuelType: '',
      yearOfManufacturing: '',
      chassisNumber: '',
      endorsementName: '',
      endorsementReason: '',
      endorsementPolicyNumber: '',
      endorStartDate: '',
      endorEndDate: '',
      endorsementTerrorism: '',
      endorsementOtherTerrorism: '',
      endorsementNetPremium: '',
      endorsementGst: '',
      endorsementGstAmount: '',
      paymentMode: '',
      etotalAmount: '',
      paidAmount: '',
      transactionDate: '',
      posMisRef: '',
      bqpCode: '',
      rateOnOtherTerr: '',
      amountOnOtherTerr: '',
      rateOnTerr: '',
      amountOnTerr: '',
      odBrokerageRate: '',
      odBrokerageAmount: '',
      tpBrokerageRate: '',
      tpBrokerageAmount: '',
      totalBrokerageAmount: '',
      totalBrokerageGst: '',
      totalBrokerageAmountincGst: '',
      sharePercentage: '',
      coBrokerageAmount: ''
    };
  }

  // Fetch dropdown and lead details
  const fetchDropdownData = async () => {
    try {
      const [
        financialYearData,
        gstData,
        clientList,
        prefixData,
        branchCodeData,
        insCompanyDataRes,
        companyDataRes,
        insDepartmentData,
        productData,
        subProductData,
        riskCodeData,
        addonData,
        endorsementData,
        brokerageRateData,
        customerGroupData,
        subCustomerGroupData,
        brokerNameData,
        branchBrokerData,
        incotermsData,
        fuelTypeData,
        paymentModeRes
      ] = await Promise.all([
        get('financialYear').catch(() => ({})),
        get('gst-percentage').catch(() => ({})),
        get('customerRegistration').catch(() => ({})),
        get('prefix').catch(() => ({})),
        get('brokerBranch').catch(() => ({})),
        get('insCompany').catch(() => ({})),
        get('company').catch(() => ({})),
        get('insDepartment').catch(() => ({})),
        get('productOrServiceCategory').catch(() => ({})),
        get('subproductCategory').catch(() => ({})),
        get('riskCode').catch(() => ({})),
        get('otherAddon').catch(() => ({})),
        get('endorsement').catch(() => ({})),
        get('brokerageRate').catch(() => ({})),
        get('customerGroup').catch(() => ({})),
        get('subCustomerGroup').catch(() => ({})),
        get('brokerName').catch(() => ({})),
        get('branchBroker').catch(() => ({})),
        get('incoterms').catch(() => ({})),
        get('fuelType').catch(() => ({})),
        get('payment-mode').catch(() => ({}))
      ]);
      setFinancialYearData(financialYearData.data || []);
      setGstData(gstData.data || []);
      setClientList(clientList.data || []);
      setPrefixData(prefixData.allPrefix || []);
      setBranchCodeData(branchCodeData.data || []);
      const combinedCompanies = [
        ...(insCompanyDataRes.data || []),
        ...(companyDataRes.data || [])
      ];
      setInsCompanyData(combinedCompanies);
      setInsDepartmentData(insDepartmentData.data || []);
      setProductData(productData.data || []);
      setSubProductData(subProductData.data || []);
      setRiskCodeData(riskCodeData.data || []);
      setAddonData(addonData.data || []);
      setEndorsementData(endorsementData.data || []);
      setBrokerageRateData(brokerageRateData.data || []);
      setCustomerGroupData(customerGroupData.data || []);
      setSubCustomerGroupData(subCustomerGroupData.data || []);
      setBrokerNameData(brokerNameData.data || []);
      setBranchBrokerData(branchBrokerData.data || []);
      setIncotermsData(incotermsData.data || []);
      setFuelTypeData(fuelTypeData.data || []);
      setPaymentModeData(paymentModeRes?.paymentMode || []);
    } catch (err) {
      console.error('Dropdown load error:', err);
    }
  };

  const safeFormatDate = (val, fallback = '') => {
    if (!val) return fallback;
    const str = String(val).trim();
    if (!str) return fallback;

    if (str.includes('T')) return str.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const dmyMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    const ymdMatch = str.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymdMatch) {
      const [, y, m, d] = ymdMatch;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    if (/^\d{5}(\.\d+)?$/.test(str)) {
      const serial = parseFloat(str);
      const parsedDate = new Date(Math.round((serial - 25569) * 86400 * 1000));
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }

    const dObj = new Date(val);
    if (!isNaN(dObj.getTime())) {
      return dObj.toISOString().split('T')[0];
    }
    return fallback;
  };

  const fetchPolicyDetailById = async () => {
    try {
      const res = await get(`policyDetail/${id}/`);
      if (res.success) {
        const policyData = res.data;
        setPolicyData(res.data);
        console.log('Pol ', policyData);
        setDepartmentValue(policyData.insDepartment?._id || policyData.insDepartment || '');
        const normClientType = String(policyData.clientType || 'retail').toLowerCase();
        setClientTypeValue(normClientType);
        setBranchNameId(policyData.branchCode?._id || policyData.branchCode || '');
        setForm((prev) => ({
          ...prev,
          policyData,
          branchName: policyData?.branchName || '',
          email: policyData?.email || '',
          mobile: policyData?.mobile || '',
          clientType: normClientType,
          cutomerName: policyData?.cutomerName || '',
          showNominee: policyData?.showNominee || false,
          nomineeName: policyData?.nomineeName || '',
          nomineeRelation: policyData?.nomineeRelation || '',
          nomineeContact: policyData?.nomineeContact || '',
          livesCover: policyData?.livesCover || '',
          numberOfInstallments: policyData?.numberOfInstallments || '',
          nextInstallmentDate: policyData?.nextInstallmentDate ? policyData?.nextInstallmentDate?.split('T')[0] : '',
          policyDuration: policyData?.policyDuration || 'YEARLY',
          startDate: safeFormatDate(policyData?.startDate),
          endDate: safeFormatDate(policyData?.endDate, safeFormatDate(policyData?.renewalDate, safeFormatDate(policyData?.odEndDate, safeFormatDate(policyData?.tpEndDate)))),
          tpPolicyDuration: policyData?.tpPolicyDuration || 'YEARLY',
          tpStartDate: safeFormatDate(policyData?.tpStartDate, safeFormatDate(policyData?.startDate)),
          tpEndDate: safeFormatDate(policyData?.tpEndDate, safeFormatDate(policyData?.endDate, safeFormatDate(policyData?.renewalDate, safeFormatDate(policyData?.odEndDate)))),
          tpPremium: policyData?.tpPremium || '',
          tpGstAmount: policyData?.tpGstAmount || '',
          tpAmount: policyData?.tpAmount || '',
          odPolicyDuration: policyData?.odPolicyDuration || 'YEARLY',
          odStartDate: safeFormatDate(policyData?.odStartDate, safeFormatDate(policyData?.startDate)),
          odEndDate: safeFormatDate(policyData?.odEndDate, safeFormatDate(policyData?.endDate, safeFormatDate(policyData?.renewalDate, safeFormatDate(policyData?.tpEndDate)))),
          odPremium: policyData?.odPremium || '',
          odGstAmount: policyData?.odGstAmount || '',
          odAmount: policyData?.odAmount || '',
          renewalDate: safeFormatDate(policyData?.renewalDate, safeFormatDate(policyData?.endDate, safeFormatDate(policyData?.odEndDate, safeFormatDate(policyData?.tpEndDate)))),
          renewable: policyData?.renewable || '',
          SGST: policyData?.SGST || '',
          CGST: policyData?.CGST || '',
          IGST: policyData?.IGST || '',
          UGST: policyData?.UGST || '',
          engineNumber: policyData?.engineNumber || '',
          monthYearOfRegn: policyData?.monthYearOfRegn || '',
          yearOfManufacturing: policyData?.yearOfManufacturing || '',
          vehicleMake: policyData?.vehicleMake || '',
          vehicleModel: policyData?.vehicleModel || '',
          vehicleSubModel: policyData?.vehicleSubModel || '',
          vehicleNumber: policyData?.vehicleNumber || '',
          chassisNumber: policyData?.chassisNumber || '',
          insurerName: policyData?.insurerName || policyData?.insCompany?.insCompany || policyData?.insCompany?.name || '',
          gstNo: policyData?.gstNo || '',
          sumInsured: formatAmountWithCommas(policyData?.sumInsured),
          occupation: policyData?.occupation || '',
          permiumOtherThanTerrorism: formatAmountWithCommas(policyData?.permiumOtherThanTerrorism),
          policyNumber: policyData?.policyNumber || '',
          terrorism: formatAmountWithCommas(policyData?.terrorism),
          netPremium: formatAmountWithCommas(policyData?.netPremium),
          gstAmount: formatAmountWithCommas(policyData?.gstAmount),
          endorsementName: policyData?.endorsementName || '',
          endorsementPolicyNumber: policyData?.endorsementPolicyNumber || '',
          endorsementTerrorism: formatAmountWithCommas(policyData?.endorsementTerrorism),
          endorsementOtherTerrorism: formatAmountWithCommas(policyData?.endorsementOtherTerrorism),
          endorsementNetPremium: formatAmountWithCommas(policyData?.endorsementNetPremium),
          endorsementGstAmount: formatAmountWithCommas(policyData?.endorsementGstAmount),
          etotalAmount: formatAmountWithCommas(policyData?.etotalAmount),
          endorStartDate: policyData?.endorStartDate ? policyData?.endorStartDate?.split('T')[0] : '',
          endorEndDate: policyData?.endorEndDate ? policyData?.endorEndDate?.split('T')[0] : '',
          paymentMode: typeof policyData?.paymentMode === 'object'
            ? (policyData?.paymentMode?.paymentMode || policyData?.paymentMode?.name || '').toUpperCase().trim()
            : String(policyData?.paymentMode || '').toUpperCase().trim(),
          paidAmount: formatAmountWithCommas(policyData?.paidAmount),
          chequeNo: policyData?.chequeNo || '',
          transactionDate: policyData?.transactionDate ? policyData?.transactionDate?.split('T')[0] : '',
          posMisRef: policyData?.posMisRef || '',
          bqpCode: policyData?.bqpCode || '',
          amountOnOtherTerr: formatAmountWithCommas(policyData?.amountOnOtherTerr),
          amountOnTerr: formatAmountWithCommas(policyData?.amountOnTerr),
          tpBrokerageAmount: formatAmountWithCommas(policyData?.tpBrokerageAmount),
          odBrokerageAmount: formatAmountWithCommas(policyData?.odBrokerageAmount),

          totalBrokerageAmount: formatAmountWithCommas(policyData?.totalBrokerageAmount),
          totalBrokerageGst: policyData?.totalBrokerageGst !== undefined && policyData?.totalBrokerageGst !== null ? Number(policyData?.totalBrokerageGst) : '',
          totalBrokerageAmountincGst: formatAmountWithCommas(policyData?.totalBrokerageAmountincGst),
          totalAmount: formatAmountWithCommas(policyData?.totalAmount),
          sharePercentage: policyData?.sharePercentage || '',
          coBrokerageAmount: formatAmountWithCommas(policyData?.coBrokerageAmount),
          financialYear: policyData?.financialYear?._id
            ? String(policyData?.financialYear._id)
            : policyData?.financialYear
              ? String(policyData?.financialYear)
              : '',
          branchCode: policyData?.branchCode?._id
            ? String(policyData?.branchCode._id)
            : policyData?.branchCode
              ? String(policyData?.branchCode)
              : '',
          brokerName: policyData?.brokerName?._id
            ? String(policyData?.brokerName._id)
            : policyData?.brokerName
              ? String(policyData?.brokerName)
              : '',
          branchBroker: policyData?.branchBroker?._id
            ? String(policyData?.branchBroker._id)
            : policyData?.branchBroker
              ? String(policyData?.branchBroker)
              : '',
          subProduct: policyData?.subProduct?._id
            ? String(policyData?.subProduct._id)
            : policyData?.subProduct
              ? String(policyData?.subProduct)
              : '',
          customerGroup: policyData?.customerGroup?._id
            ? String(policyData?.customerGroup._id)
            : policyData?.customerGroup
              ? String(policyData?.customerGroup)
              : '',
          subCustomerGroup: policyData?.subCustomerGroup?._id
            ? String(policyData?.subCustomerGroup._id)
            : policyData?.subCustomerGroup
              ? String(policyData?.subCustomerGroup)
              : '',
          retailCustomer: policyData?.retailCustomer?._id
            ? String(policyData?.retailCustomer._id)
            : policyData?.retailCustomer
              ? String(policyData?.retailCustomer)
              : '',
          prefix: policyData?.prefix?._id ? String(policyData?.prefix._id) : policyData?.prefix ? String(policyData?.prefix) : '',
          insDepartment: policyData?.insDepartment?._id
            ? String(policyData?.insDepartment._id)
            : policyData?.insDepartment
              ? String(policyData?.insDepartment)
              : '',
          product: policyData?.product?._id ? String(policyData?.product._id) : policyData?.product ? String(policyData?.product) : '',
          incoterms: policyData?.incoterms?._id
            ? String(policyData?.incoterms._id)
            : policyData?.incoterms
              ? String(policyData?.incoterms)
              : '',
          insCompany: policyData?.insCompany?._id
            ? String(policyData?.insCompany._id)
            : policyData?.insCompany
              ? String(policyData?.insCompany)
              : '',

          tpGst: policyData?.tpGst?._id
            ? String(policyData?.tpGst._id)
            : policyData?.tpGst
              ? String(policyData?.tpGst)
              : (policyData?.gst?._id ? String(policyData?.gst._id) : policyData?.gst ? String(policyData?.gst) : ''),
          odGst: policyData?.odGst?._id
            ? String(policyData?.odGst._id)
            : policyData?.odGst
              ? String(policyData?.odGst)
              : (policyData?.gst?._id ? String(policyData?.gst._id) : policyData?.gst ? String(policyData?.gst) : ''),
          gst: policyData?.gst?._id ? String(policyData?.gst._id) : policyData?.gst ? String(policyData?.gst) : '',
          tpBrokerageRate: policyData?.tpBrokerageRate?._id
            ? String(policyData?.tpBrokerageRate._id)
            : policyData?.tpBrokerageRate
              ? String(policyData?.tpBrokerageRate)
              : '',
          odBrokerageRate: policyData?.odBrokerageRate?._id
            ? String(policyData?.odBrokerageRate._id)
            : policyData?.odBrokerageRate
              ? String(policyData?.odBrokerageRate)
              : '',

           endorsementGst: policyData?.endorsementGst?._id
            ? String(policyData?.endorsementGst._id)
            : policyData?.endorsementGst
              ? String(policyData?.endorsementGst)
              : '',
          endorsementReason: policyData?.endorsementReason?._id
            ? String(policyData?.endorsementReason._id)
            : policyData?.endorsementReason
              ? String(policyData?.endorsementReason)
              : '',
          rateOnOtherTerr: policyData?.rateOnOtherTerr?._id
            ? String(policyData?.rateOnOtherTerr._id)
            : policyData?.rateOnOtherTerr
              ? String(policyData?.rateOnOtherTerr)
              : '',
          rateOnTerr: policyData?.rateOnTerr?._id
            ? String(policyData?.rateOnTerr._id)
            : policyData?.rateOnTerr
              ? String(policyData?.rateOnTerr)
              : '',
          riskCode: policyData?.riskCode?._id ? String(policyData?.riskCode._id) : policyData?.riskCode ? String(policyData?.riskCode) : '',
          fuelType: policyData?.fuelType?._id ? String(policyData?.fuelType._id) : policyData?.fuelType ? String(policyData?.fuelType) : '',
          otherAddon: policyData?.otherAddon?._id
            ? String(policyData?.otherAddon._id)
            : policyData?.otherAddon
              ? String(policyData?.otherAddon)
              : '',
          siteLocation: policyData?.siteLocation || '',
          retroActive: policyData?.retroActive || '',
          marineClause: policyData?.marineClause || '',
          checkSubGroup: policyData?.checkSubGroup || ''
        }));

        setGstData((prev) => {
          const list = [...prev];
          [policyData?.gst, policyData?.tpGst, policyData?.odGst, policyData?.endorsementGst].forEach((item) => {
            if (item && typeof item === 'object' && item._id && !list.some((x) => String(x._id) === String(item._id))) {
              list.push(item);
            }
          });
          return list;
        });

        setBrokerageRateData((prev) => {
          const list = [...prev];
          [policyData?.tpBrokerageRate, policyData?.odBrokerageRate, policyData?.rateOnTerr, policyData?.rateOnOtherTerr].forEach((item) => {
            if (item && typeof item === 'object' && item._id && !list.some((x) => String(x._id) === String(item._id))) {
              list.push(item);
            }
          });
          return list;
        });

        setEndorsementData((prev) => {
          const list = [...prev];
          if (policyData?.endorsementReason && typeof policyData?.endorsementReason === 'object' && policyData?.endorsementReason._id && !list.some((x) => String(x._id) === String(policyData.endorsementReason._id))) {
            list.push(policyData.endorsementReason);
          }
          return list;
        });

        if (policyData?.sharePercentage || policyData?.coBrokerageAmount) {
          setShowCoBrokerage(true);
        }
        if (policyData?.endorsementName || policyData?.endorsementPolicyNumber || policyData?.endorsementNetPremium || policyData?.etotalAmount) {
          if (!policyData?.totalBrokerageAmount && !policyData?.tpBrokerageAmount && !policyData?.odBrokerageAmount) {
            setBrokerageValue('endorsement');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
    }
  };

  const handleFetchEndorsementPolicy = async (policyNo) => {
    if (!policyNo) return;
    try {
      const res = await get(`policyDetail?policyNumber=${encodeURIComponent(policyNo)}`);
      if (res && res.data && res.data.length > 0) {
        const policyData = res.data[0];
        toast.success('Original Policy details fetched successfully');
        setForm((prev) => ({
          ...prev,
          clientType: policyData.clientType || '',
          retailCustomer: policyData.retailCustomer?._id || policyData.retailCustomer || '',
          customerGroup: policyData.customerGroup?._id || policyData.customerGroup || '',
          subCustomerGroup: policyData.subCustomerGroup?._id || policyData.subCustomerGroup || '',
          checkSubGroup: policyData.checkSubGroup || '',
          branchCode: policyData.branchCode?._id || policyData.branchCode || '',
          branchName: policyData.branchName || '',
          prefix: policyData.prefix?._id || policyData.prefix || '',
          cutomerName: policyData.cutomerName || '',
          mobile: policyData.mobile || '',
          email: policyData.email || '',
          insurerName: policyData.insurerName || '',
          gstNo: policyData.gstNo || '',
          insDepartment: policyData.insDepartment?._id || policyData.insDepartment || '',
          product: policyData.product?._id || policyData.product || '',
          subProduct: policyData.subProduct?._id || policyData.subProduct || '',
          insCompany: policyData.insCompany?._id || policyData.insCompany || '',
          brokerName: policyData.brokerName?._id || policyData.brokerName || '',
          branchBroker: policyData.branchBroker?._id || policyData.branchBroker || '',
        }));
        if (policyData.insDepartment) {
          setDepartmentValue(policyData.insDepartment?._id || policyData.insDepartment);
        }
        if (policyData.clientType) {
          setClientTypeValue(policyData.clientType);
        }
      } else {
        toast.warning('No policy found with this Policy Number');
      }
    } catch (e) {
      console.error('Error fetching endorsement policy:', e);
      toast.error('Failed to fetch policy details');
    }
  };

  const handleCheckboxChange = (event) => {
    setShowNominee(event.target.checked);
  };

  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) return '';

    const start = new Date(startDate);
    const end = new Date(start);

    switch (duration) {
      case 'YEARLY':
        end.setFullYear(end.getFullYear() + 1);
        break;

      case 'QUARTERLY':
        end.setMonth(end.getMonth() + 3);
        break;

      case 'MONTHLY':
        end.setMonth(end.getMonth() + 1);
        break;

      case 'DAYS':
        return null;
      case 'TILL END OF VOYAGE':
        return 'TILL END OF VOYAGE';

      default:
        return '';
    }

    // 🔹 subtract 1 day
    end.setDate(end.getDate() - 1);

    return end.toISOString().split('T')[0]; // yyyy-mm-dd
  };

  useEffect(() => {
    if (!form.startDate || !form.policyDuration) return;

    const startDateObj = new Date(form.startDate);
    startDateObj.setDate(startDateObj.getDate() - 2);

    const transactionDate = startDateObj.toISOString().split('T')[0];

    const calculatedEndDate = calculateEndDate(form.startDate, form.policyDuration);

    if (calculatedEndDate === '') return;

    setForm((prev) => {
      const nextForm = { ...prev, transactionDate };
      if (calculatedEndDate !== null) {
        nextForm.endDate = calculatedEndDate;
        nextForm.renewalDate = calculatedEndDate;
      }
      return nextForm;
    });
  }, [form.startDate, form.policyDuration]);

  const filteredProducts = useMemo(() => {
    return productData;
  }, [productData]);

  useEffect(() => {
    if (!form.tpStartDate || !form.tpPolicyDuration) return;

    const startDateObj = new Date(form.tpStartDate);
    startDateObj.setDate(startDateObj.getDate() - 2);
    const transactionDate = startDateObj.toISOString().split('T')[0];

    const computedTpEndDate = calculateEndDate(form.tpStartDate, form.tpPolicyDuration);
    if (computedTpEndDate === '') return;

    setForm((prev) => {
      let tpEndDate = prev.tpEndDate;
      if (computedTpEndDate !== null) {
        tpEndDate = computedTpEndDate;
      }
      const renewalDate = prev.renewalDate || prev.odEndDate || tpEndDate;
      if (prev.tpEndDate === tpEndDate && prev.renewalDate === renewalDate) return prev;
      return {
        ...prev,
        tpEndDate,
        transactionDate: prev.transactionDate || transactionDate,
        renewalDate
      };
    });
  }, [form.tpStartDate, form.tpPolicyDuration]);

  useEffect(() => {
    if (!form.odStartDate || !form.odPolicyDuration) return;

    const startDateObj = new Date(form.odStartDate);
    startDateObj.setDate(startDateObj.getDate() - 2);
    const transactionDate = startDateObj.toISOString().split('T')[0];

    const computedOdEndDate = calculateEndDate(form.odStartDate, form.odPolicyDuration);
    if (computedOdEndDate === '') return;

    setForm((prev) => {
      let odEndDate = prev.odEndDate;
      if (computedOdEndDate !== null) {
        odEndDate = computedOdEndDate;
      }
      const renewalDate = prev.renewalDate || odEndDate || prev.tpEndDate;
      if (prev.odEndDate === odEndDate && prev.renewalDate === renewalDate) return prev;
      return {
        ...prev,
        odEndDate,
        transactionDate: prev.transactionDate || transactionDate,
        renewalDate
      };
    });
  }, [form.odStartDate, form.odPolicyDuration]);

  const selectedProductName = useMemo(() => {
    const selectedProduct = productData.find((p) => p._id === form.product);

    return selectedProduct?.productName?.trim() || '';
  }, [productData, form.product]);

  const filteredSubProducts = useMemo(() => {
    if (!selectedProductName) {
      return subProductData; // no product selected → show all
    }

    return subProductData.filter((sub) => sub.productName?.trim() === selectedProductName);
  }, [subProductData, selectedProductName]);

  useEffect(() => {
    const tpPremium = parseAmount(form?.tpPremium);
    const tpGstId = form?.tpGst;
    const tpGstValue = parseAmount(gstData?.find((i) => i._id === tpGstId)?.value);

    const tpGstAmount = round2(tpPremium * (tpGstValue / 100));
    const tpAmount = round2(tpPremium + tpGstAmount);

    const odPremium = parseAmount(form?.odPremium);
    const odGstId = form?.odGst;
    const odGstValue = parseAmount(gstData?.find((i) => i._id === odGstId)?.value);

    const odGstAmount = round2(odPremium * (odGstValue / 100));
    const odAmount = round2(odPremium + odGstAmount);

    const totalPremium = round2(tpPremium + odPremium);
    const gstAmount = round2(tpGstAmount + odGstAmount);
    const totalAmount = round2(tpAmount + odAmount);

    setForm((prev) => ({
      ...prev,
      tpGstAmount: formatAmountWithCommas(tpGstAmount),
      tpAmount: formatAmountWithCommas(tpAmount),
      odGstAmount: formatAmountWithCommas(odGstAmount),
      odAmount: formatAmountWithCommas(odAmount),
      netPremium: formatAmountWithCommas(totalPremium),
      gstAmount: formatAmountWithCommas(gstAmount),
      totalAmount: formatAmountWithCommas(totalAmount),
      paidAmount: formatAmountWithCommas(totalAmount)
    }));
  }, [form.tpPremium, form.odPremium, form.tpGst, form.odGst, gstData]);

  useEffect(() => {
    if (!selectedDeptName.includes('motor')) {
      if (form.netPremium === '') {
        setForm((prev) => ({
          ...prev,
          gstAmount: 0,
          totalAmount: 0,
          paidAmount: 0
        }));
        return;
      }
      const netPremium = round2(parseAmount(form.netPremium));

      if (form.netPremium != '') {
        const gstValue = parseAmount(gstData?.find((i) => i._id === form.gst)?.value);
        const gstAmount = round2(netPremium * (gstValue / 100)) || 0;
        const totalAmount = round2(netPremium + gstAmount);

        setForm((prev) => ({
          ...prev,
          gstAmount: formatAmountWithCommas(gstAmount),
          totalAmount: formatAmountWithCommas(totalAmount),
          paidAmount: formatAmountWithCommas(totalAmount)
        }));
      }
    }
  }, [form.netPremium, form.gst, selectedDeptName, gstData]);

  const safeNum = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v) || 0);

  // console.log('Filtered Sub Pro,', filteredSubProducts);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const valToSet = POLICY_AMOUNT_FIELDS.includes(name) ? formatAmountWithCommas(value) : value;

    setForm((prev) => {
      let nextForm = { ...prev, [name]: valToSet };

      if (name === 'branchCode') {
        const selectedId = value;
        const selectedName = branchCodeData.find((branch) => branch._id === selectedId);
        if (selectedName) {
          nextForm.branchName = selectedName.branchName;
        }
      }
      if (name === 'retailCustomer') {
        const selectedId = value;
        if (selectedId === 'other') {
          nextForm.retailCustomer = 'other';
          nextForm.cutomerName = '';
          nextForm.mobile = '';
          nextForm.email = '';
          nextForm.gstNo = '';
        } else {
          const selectedCustomer = clientList.find((customer) => customer._id === selectedId);
          if (selectedCustomer) {
            nextForm.retailCustomer = selectedId;
            nextForm.cutomerName = selectedCustomer.customerName || selectedCustomer.name || '';
            nextForm.mobile = selectedCustomer.mobile || '';
            nextForm.email = selectedCustomer.email || '';
            nextForm.gstNo = selectedCustomer.gstNo || '';
          }
        }
      }
      if (name === 'customerGroup') {
        const selectedId = value;
        if (selectedId === 'other') {
          nextForm.customerGroup = 'other';
          nextForm.cutomerName = '';
          nextForm.mobile = '';
          nextForm.email = '';
          nextForm.gstNo = '';
        } else {
          const selectedGroup = customerGroupData.find((group) => group._id === selectedId);
          if (selectedGroup) {
            nextForm.customerGroup = selectedId;
            nextForm.cutomerName = selectedGroup.customerGroupName || '';
            nextForm.mobile = selectedGroup.mobile || '';
            nextForm.email = selectedGroup.email || '';
            nextForm.gstNo = selectedGroup.gstNo || '';
          }
        }
      }
      if (name === 'insurerName') {
        const selectedCompanyObj = insCompanyData.find((c) => (c.insCompany || c.name || c.companyName) === value);
        if (selectedCompanyObj) {
          nextForm.insCompany = selectedCompanyObj._id;
        }
      }
      if (name === 'insCompany') {
        const selectedCompanyObj = insCompanyData.find((c) => String(c._id) === String(value));
        if (selectedCompanyObj) {
          nextForm.insurerName = selectedCompanyObj.insCompany || selectedCompanyObj.name || selectedCompanyObj.companyName || '';
        }
      }
      if (name === 'startDate') {
        if (!nextForm.tpStartDate || nextForm.tpStartDate === prev.startDate) nextForm.tpStartDate = value;
        if (!nextForm.odStartDate || nextForm.odStartDate === prev.startDate) nextForm.odStartDate = value;
      }
      if (name === 'endDate' || name === 'renewalDate') {
        if (!nextForm.tpEndDate || nextForm.tpEndDate === prev.endDate || nextForm.tpEndDate === prev.renewalDate) nextForm.tpEndDate = value;
        if (!nextForm.odEndDate || nextForm.odEndDate === prev.endDate || nextForm.odEndDate === prev.renewalDate) nextForm.odEndDate = value;
        if (name === 'endDate') nextForm.renewalDate = value;
        if (name === 'renewalDate') nextForm.endDate = value;
      }
      if (name === 'tpStartDate' || name === 'odStartDate') {
        if (!nextForm.startDate || nextForm.startDate === prev.tpStartDate || nextForm.startDate === prev.odStartDate) {
          nextForm.startDate = value;
        }
      }
      if (name === 'tpEndDate' || name === 'odEndDate') {
        if (!nextForm.endDate || nextForm.endDate === prev.tpEndDate || nextForm.endDate === prev.odEndDate) {
          nextForm.endDate = value;
          nextForm.renewalDate = value;
        }
      }
      
      if (name === 'insDepartment') {
        const selectedDept = insDepartmentData.find((d) => String(d._id) === String(value));
        const deptName = selectedDept?.insDepartment || selectedDept?.name || '';
        if (deptName.toLowerCase().includes('travel')) {
          const gst0 = gstData.find(g => Math.round(g.value) === 0);
          if (gst0) {
            nextForm.gst = gst0._id;
            nextForm.tpGst = gst0._id;
            nextForm.odGst = gst0._id;
          }
        }
      }
      
      if (name === 'product' || name === 'subProduct') {
        const prod = productData.find((p) => p._id === (name === 'product' ? value : nextForm.product));
        const subProd = subProductData.find((p) => p._id === (name === 'subProduct' ? value : nextForm.subProduct));
        const pName = prod?.productName || prod?.name || '';
        const spName = subProd?.subproductName || subProd?.subProductName || subProd?.name || '';
        const combined = (pName + ' ' + spName).toLowerCase();
        
        if (combined.includes('commercial vehicle od') || combined.includes('commercial vehicle - od')) {
          const gst18 = gstData.find(g => Math.round(g.value) === 18);
          if (gst18) {
            nextForm.gst = gst18._id;
            nextForm.tpGst = gst18._id;
            nextForm.odGst = gst18._id;
          }
        }
      }

      return nextForm;
    });

    if (name === 'insDepartment') {
      setDepartmentValue(value);
    }
    if (name === 'clientType') {
      setClientTypeValue(String(value).toLowerCase());
    }

    setTaxes({
      ...taxes,
      [e.target.name]: e.target.checked
    });

    const error = validateForm();

    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBrokerage = (e) => setBrokerageValue(e.target.value);

  const validateForm = () => {
    const newErrors = {};
    const missingFields = [];

    if (!form.clientType) {
      newErrors.clientType = 'Client Type is required';
      missingFields.push('Client Type');
    }
    if (!form.branchCode) {
      newErrors.branchCode = 'Branch Code is required';
      missingFields.push('Branch Code');
    }
    if (!form.insurerName && !form.cutomerName) {
      newErrors.insurerName = 'Customer Name is required';
      missingFields.push('Customer Name');
    }
    if (!form.insDepartment) {
      newErrors.insDepartment = 'Insurance Department is required';
      missingFields.push('Insurance Department');
    }
    if (!form.product) {
      newErrors.product = 'Product is required';
      missingFields.push('Product');
    }
    if (!form.insCompany) {
      newErrors.insCompany = 'Insurance Company is required';
      missingFields.push('Insurance Company');
    }
    if (!form.policyNumber) {
      newErrors.policyNumber = 'Policy Number is required';
      missingFields.push('Policy Number');
    }
    if (!form.paymentMode) {
      newErrors.paymentMode = 'Payment Mode is required';
      missingFields.push('Payment Mode');
    }

    if (clientTypeValue === 'retail' || form.clientType === 'retail') {
      if (!form.retailCustomer) {
        newErrors.retailCustomer = 'Retail Customer is required';
        missingFields.push('Retail Customer');
      }
    } else if (clientTypeValue === 'corporate' || form.clientType === 'corporate') {
      if (!form.customerGroup) {
        newErrors.customerGroup = 'Parent Group is required';
        missingFields.push('Parent Group');
      }
    }

    if (selectedDeptName === 'motor') {
      if (!form.tpPolicyDuration && !form.odPolicyDuration) {
        newErrors.tpPolicyDuration = 'TP/OD Policy Duration is required';
        missingFields.push('TP/OD Policy Duration');
      }
      if (!form.tpPremium && !form.odPremium) {
        newErrors.tpPremium = 'TP/OD Premium is required';
        missingFields.push('TP/OD Premium');
      }
      if (!form.tpStartDate && !form.odStartDate) {
        newErrors.tpStartDate = 'TP/OD Start Date is required';
        missingFields.push('TP/OD Start Date');
      }
    } else {
      if (!form.policyDuration) {
        newErrors.policyDuration = 'Policy Duration is required';
        missingFields.push('Policy Duration');
      }
      if (!form.netPremium) {
        newErrors.netPremium = 'Net Premium is required';
        missingFields.push('Net Premium');
      }
      if (!form.startDate) {
        newErrors.startDate = 'Start Date is required';
        missingFields.push('Start Date');
      }
    }

    if (form.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      newErrors.email = 'Invalid email format';
      missingFields.push('Valid Email Format');
    }

    if (form.mobile && !/^[0-9+\s\-()]{7,15}$/.test(String(form.mobile).trim())) {
      newErrors.mobile = 'Invalid mobile number';
      missingFields.push('Valid Mobile Number');
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (!isValid) {
      toast.error(`Policy form cannot be updated due to errors: ${missingFields.join(', ')}`);
    }

    return isValid;
  };

  const sanitizeFormPayload = (formData) => {
    const cleaned = { ...formData };
    const numericKeys = [
      'sumInsured',
      'netPremium',
      'gstAmount',
      'totalAmount',
      'endorsementNetPremium',
      'endorsementGstAmount',
      'etotalAmount',
      'paidAmount',
      'amountOnOtherTerr',
      'amountOnTerr',
      'tpBrokerageAmount',
      'odBrokerageAmount',
      'totalBrokerageAmount',
      'totalBrokerageGst',
      'totalBrokerageAmountincGst',
      'sharePercentage',
      'coBrokerageAmount',
      'tpPremium',
      'odPremium',
      'tpGstAmount',
      'odGstAmount',
      'tpAmount',
      'odAmount'
    ];

    numericKeys.forEach((key) => {
      if (cleaned[key] !== undefined && cleaned[key] !== null) {
        if (typeof cleaned[key] === 'string') {
          const stripped = cleaned[key].replace(/,/g, '').trim();
          if (stripped === '') {
            cleaned[key] = null;
          } else if (!isNaN(Number(stripped))) {
            cleaned[key] = Number(stripped);
          }
        }
      }
    });

    return cleaned;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const payload = sanitizeFormPayload(form);
      const response = await put(`policyDetail/${id}`, payload);
      const isSuccess = response && response.success !== false && response.status !== 'false' && response.status !== false && !response.error;

      if (isSuccess) {
        toast.success(response.message || '✅ Policy updated successfully!', {
          autoClose: 3000,
          theme: 'colored'
        });
        navigate('/policy');
      } else {
        const userFriendlyMsg = formatApiErrorMessage(response?.error || response?.message);
        toast.error(userFriendlyMsg, { autoClose: 6000 });

        if (response?.error && response.error.includes('at path "')) {
          const match = response.error.match(/at path "([^"]+)"/);
          if (match && match[1]) {
            setErrors((prev) => ({
              ...prev,
              [match[1]]: userFriendlyMsg
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast.error(formatApiErrorMessage(error.message, 'Failed to update policy. Please try again.'));
    }
  };

  useEffect(() => {
    const fetchSubCustomerByCustomer = async () => {
      const selectedId = form.customerGroup;
      // const selectedName = customerGroupData.find((branch) => branch._id === selectedId);
      // console.log('bb ', selectedId);
      const res = await get(`subCustomerGroup/${selectedId}`);
      console.log('Sub Customers   ', res.data);
      if (res.data) setSubCustomerGroupData(res.data);
      else setSubCustomerGroupData([]);
    };

    fetchSubCustomerByCustomer();
  }, [form.customerGroup]);
  useEffect(() => {
    const fetchSubProductsByProduct = async () => {
      const selectedId = form.product;
      const selectedName = productData.find((branch) => branch._id === selectedId);
      if (!selectedName || !selectedName.productName) {
        setSubProductData([]);
        return;
      }
      const productName = selectedName.productName;
      const res = await get(`subproductCategory/${productName}`);
      // console.log('Sub Products', res.data);
      if (res.data) setSubProductData(res.data);
      else setSubProductData([]);
    };

    fetchSubProductsByProduct();
  }, [form.product, productData]);

  const isEditMode = Boolean(policyData?._id);

  useEffect(() => {
    // ⛔ wait until gstData is loaded
    if (!gstData || gstData.length === 0) return;

    const tpPremium = parseAmount(form.tpPremium);
    const odPremium = parseAmount(form.odPremium);

    // ⛔ if both premiums are empty, don’t calculate
    if (!tpPremium && !odPremium) return;

    const tpGstValue = parseAmount(gstData.find((i) => i._id === (form.tpGst || form.gst))?.value);
    const odGstValue = parseAmount(gstData.find((i) => i._id === (form.odGst || form.gst))?.value);

    // ⛔ in edit mode, don’t override existing values
    if (isEditMode && !tpGstValue && !odGstValue) return;

    const tpGstAmount = tpGstValue ? tpPremium * (tpGstValue / 100) : parseAmount(form.tpGstAmount);
    const odGstAmount = odGstValue ? odPremium * (odGstValue / 100) : parseAmount(form.odGstAmount);

    const netPremium = tpPremium + odPremium;
    const gstAmount = tpGstAmount + odGstAmount;
    const totalAmount = netPremium + gstAmount;

    setForm((prev) => ({
      ...prev,
      tpGstAmount: formatAmountWithCommas(tpGstAmount),
      odGstAmount: formatAmountWithCommas(odGstAmount),
      netPremium: formatAmountWithCommas(netPremium),
      gstAmount: formatAmountWithCommas(gstAmount),
      totalAmount: formatAmountWithCommas(totalAmount)
    }));
  }, [form.tpPremium, form.odPremium, form.tpGst, form.odGst, gstData]);

  const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

  const getRateValue = (rateId) => {
    return Number(brokerageRateData?.find((r) => r._id === rateId)?.brokerageRate || 0);
  };

  useEffect(() => {
    if (!brokerageRateData || brokerageRateData.length === 0) return;

    const netPremium = parseAmount(form.netPremium);
    if (!netPremium) return;

    const otherTerrRate = getRateValue(form.rateOnOtherTerr);
    const terrRate = getRateValue(form.rateOnTerr);

    // % calculations
    const amountOnOtherTerr = round2((netPremium * otherTerrRate) / 100);
    const amountOnTerr = round2((netPremium * terrRate) / 100);

    const totalBrokerageAmount = round2(amountOnOtherTerr + amountOnTerr);

    setForm((prev) => ({
      ...prev,
      amountOnOtherTerr: formatAmountWithCommas(amountOnOtherTerr),
      amountOnTerr: formatAmountWithCommas(amountOnTerr),
      totalBrokerageAmount: formatAmountWithCommas(totalBrokerageAmount),
      totalBrokerageAmountincGst: formatAmountWithCommas(totalBrokerageAmount)
    }));
  }, [form.rateOnOtherTerr, form.rateOnTerr, form.netPremium, brokerageRateData]);

  useEffect(() => {
    if (!brokerageRateData || brokerageRateData.length === 0) return;

    const tpPremium = parseAmount(form.tpPremium);
    const odPremium = parseAmount(form.odPremium);

    // ⛔ nothing to calculate
    if (!tpPremium && !odPremium) return;

    const tpRate = getRateValue(form.tpBrokerageRate);
    const odRate = getRateValue(form.odBrokerageRate);

    // % calculations
    const tpBrokerageAmount = round2((tpPremium * tpRate) / 100);
    const odBrokerageAmount = round2((odPremium * odRate) / 100);

    const totalBrokerageAmount = round2(tpBrokerageAmount + odBrokerageAmount);

    setForm((prev) => ({
      ...prev,
      tpBrokerageAmount: formatAmountWithCommas(tpBrokerageAmount),
      odBrokerageAmount: formatAmountWithCommas(odBrokerageAmount),
      totalBrokerageAmount: formatAmountWithCommas(totalBrokerageAmount),
      totalBrokerageAmountincGst: formatAmountWithCommas(totalBrokerageAmount)
    }));
  }, [form.tpPremium, form.odPremium, form.tpBrokerageRate, form.odBrokerageRate, brokerageRateData]);

  useEffect(() => {
    const total = parseAmount(form.totalBrokerageAmount);
    const pct = parseAmount(form.sharePercentage);
    setForm((prev) => ({
      ...prev,
      coBrokerageAmount: pct ? formatAmountWithCommas(round2((total * pct) / 100)) : ''
    }));
  }, [form.totalBrokerageAmount, form.sharePercentage]);

  useEffect(() => {
    if (selectedDeptName !== 'motor') {
      const otherPrem = parseAmount(form.permiumOtherThanTerrorism);
      const terrPrem = parseAmount(form.terrorism);
      const computedNet = round2(otherPrem + terrPrem);
      setForm((prev) => ({
        ...prev,
        netPremium: formatAmountWithCommas(computedNet)
      }));
    }
  }, [form.permiumOtherThanTerrorism, form.terrorism, selectedDeptName]);

  useEffect(() => {
    const amount = parseAmount(form.totalBrokerageAmount);
    const gstPct = parseAmount(form.totalBrokerageGst);
    const incGst = round2(amount + (amount * gstPct) / 100);
    setForm((prev) => ({
      ...prev,
      totalBrokerageAmountincGst: formatAmountWithCommas(incGst)
    }));
  }, [form.totalBrokerageAmount, form.totalBrokerageGst]);

  useEffect(() => {
    const net = parseAmount(form.endorsementNetPremium);
    const gstId = form.endorsementGst;
    const gstValue = parseAmount(gstData?.find((g) => g._id === gstId)?.value || 0);
    const gstAmount = round2(net * (gstValue / 100));
    const total = round2(net + gstAmount);
    setForm((prev) => ({
      ...prev,
      endorsementGstAmount: formatAmountWithCommas(gstAmount) || '',
      etotalAmount: formatAmountWithCommas(total) || ''
    }));
  }, [form.endorsementNetPremium, form.endorsementGst, gstData]);

  // useEffect(() => {
  //   setForm((prev) => ({
  //     ...prev,
  //     tpBrokerageRate: '',
  //     odBrokerageRate: '',
  //     tpBrokerageAmount: 0,
  //     odBrokerageAmount: 0,
  //     totalBrokerageAmount: 0,
  //     totalBrokerageAmountincGst: 0,
  //   }));
  // }, [form.tpPremium, form.odPremium]);

  useEffect(() => {
    let newTaxes = {
      IGST: form?.IGST || false,
      UGST: form?.UGST || false,
      CGST: form?.CGST || false,
      SGST: form?.SGST || false
    };

    if (newTaxes.CGST) {
      newTaxes = { SGST: true, CGST: true, IGST: false, UGST: false };
    } else if (newTaxes.IGST) {
      newTaxes = { SGST: false, CGST: false, IGST: true, UGST: false };
    } else if (newTaxes.UGST) {
      newTaxes = { SGST: false, CGST: false, IGST: false, UGST: true };
    }

    setTaxes(prev => {
      // Only update if there is an actual change to prevent unnecessary renders
      if (prev.IGST === newTaxes.IGST && prev.UGST === newTaxes.UGST && prev.CGST === newTaxes.CGST && prev.SGST === newTaxes.SGST) {
        return prev;
      }
      return newTaxes;
    });
  }, [form?.IGST, form?.UGST, form?.CGST, form?.SGST]);

  useEffect(() => {
    fetchPolicyDetailById();
    fetchDropdownData();
  }, []);

  // const formatAmount = (value) => {
  //   const num = Number(value);
  //   if (isNaN(num)) return 0;

  //   return Number.isInteger(num) ? num : Number(num.toFixed(2));
  // };

  return (
    <div>
      <Card>
        <CardContent>
          <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Grid item>
              <Typography variant="h6">Policy Registration</Typography>
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                <ArrowBackIcon /> Back
              </Button>
            </Grid>
          </Grid>
          <Divider sx={{ mb: 2 }} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="financialYear">Financial Year</InputLabel>
                <Select
                  labelId="financialYear"
                  label="financialYear"
                  name="financialYear"
                  value={resolveSelectValue(financialYearData, form.financialYear, ['financialYear', 'name', 'year'])}
                  onChange={handleChange}
                >
                  {financialYearData.length > 0 &&
                    financialYearData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.financialYear || `${new Date(type.fromDate).getFullYear()} - ${new Date(type.toDate).getFullYear()}`}
                      </MenuItem>
                    ))}
                  {form.financialYear && !financialYearData.some((t) => String(t._id) === String(resolveSelectValue(financialYearData, form.financialYear))) && (
                    <MenuItem key={String(form.financialYear)} value={String(form.financialYear)}>
                      {String(form.financialYear)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.clientType}>
                <InputLabel id="clientType">Customer Type</InputLabel>
                <Select labelId="clientType" label="clientType" name="clientType" value={form.clientType || 'retail'} onChange={handleChange}>
                  <MenuItem value="retail">Retail</MenuItem>
                  <MenuItem value="corporate">Corporate</MenuItem>
                </Select>
                {errors.clientType && <FormHelperText>{errors.clientType}</FormHelperText>}
              </FormControl>
            </Grid>
            {clientTypeValue === 'retail' ? (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth error={!!errors.retailCustomer}>
                  <InputLabel id="retailCustomer">Retail Customer</InputLabel>
                  <Select
                    labelId="retailCustomer"
                    label="retailCustomer"
                    name="retailCustomer"
                    value={resolveSelectValue(clientList, form.retailCustomer, ['name', 'customerName', 'insuredName'])}
                    onChange={handleChange}
                  >
                    <MenuItem value="other">Other (Create New)</MenuItem>
                    {clientList.length > 0 &&
                      clientList.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.name}
                        </MenuItem>
                      ))}
                    {form.retailCustomer && form.retailCustomer !== 'other' && !clientList.some((t) => String(t._id) === String(resolveSelectValue(clientList, form.retailCustomer))) && (
                      <MenuItem key={String(form.retailCustomer)} value={String(form.retailCustomer)}>
                        {String(form.retailCustomer)}
                      </MenuItem>
                    )}
                  </Select>
                  {errors.retailCustomer && <FormHelperText>{errors.retailCustomer}</FormHelperText>}
                </FormControl>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth error={!!errors.customerGroup}>
                    <InputLabel id="customerGroup">Parent Group</InputLabel>
                    <Select
                      labelId="customerGroup"
                      label="customerGroup"
                      name="customerGroup"
                      value={resolveSelectValue(customerGroupData, form.customerGroup, ['customerGroupName', 'name', 'groupName'])}
                      onChange={handleChange}
                    >
                      <MenuItem value="other">Other (Create New)</MenuItem>
                      {customerGroupData.length > 0 &&
                        customerGroupData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.customerGroupName}
                          </MenuItem>
                        ))}
                      {form.customerGroup && form.customerGroup !== 'other' && !customerGroupData.some((t) => String(t._id) === String(resolveSelectValue(customerGroupData, form.customerGroup))) && (
                        <MenuItem key={String(form.customerGroup)} value={String(form.customerGroup)}>
                          {String(form.customerGroup)}
                        </MenuItem>
                      )}
                    </Select>
                    {errors.customerGroup && <FormHelperText>{errors.customerGroup}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="subCustomerGroup">Sub Group</InputLabel>
                    <Select
                      labelId="subCustomerGroup"
                      label="subCustomerGroup"
                      name="subCustomerGroup"
                      value={resolveSelectValue(subCustomerGroupData, form.subCustomerGroup, ['subCustomerGroup', 'name'])}
                      onChange={handleChange}
                    >
                      {subCustomerGroupData.length > 0 &&
                        subCustomerGroupData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.subCustomerGroup}
                          </MenuItem>
                        ))}
                      {form.subCustomerGroup && !subCustomerGroupData.some((t) => String(t._id) === String(resolveSelectValue(subCustomerGroupData, form.subCustomerGroup))) && (
                        <MenuItem key={String(form.subCustomerGroup)} value={String(form.subCustomerGroup)}>
                          {String(form.subCustomerGroup)}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControlLabel control={<Checkbox name="checkSubGroup" />} label="Check for Sub Customer Group" />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="filterByDocument">Filter by Document</InputLabel>
                <Select
                  labelId="filterByDocument"
                  label="filterByDocument"
                  name="filterByDocument"
                  value={filterByDocumentValue}
                  onChange={handleFilterByDocumentChange}
                >
                  <MenuItem value="">SELECT...</MenuItem>
                  <MenuItem value="PAN">PAN</MenuItem>
                  <MenuItem value="DL">Driving Licence</MenuItem>
                  <MenuItem value="Adhar">AADHAR</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {filterByDocumentValue && (
              <Grid item xs={12} sm={4}>
                <TextField fullWidth labelId="searchDocument" label="searchDocument" name="searchDocument" />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom>
        Basic Details
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={!!errors.branchCode}>
                <InputLabel id="branchCode">Branch Code</InputLabel>
                <Select
                  labelId="branchCode"
                  label="branchCode"
                  name="branchCode"
                  value={resolveSelectValue(branchCodeData, form.branchCode, ['branchCode', 'branchName', 'name'])}
                  onChange={handleChange}
                >
                  {branchCodeData.length > 0 &&
                    branchCodeData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.branchCode} - {type.branchName}
                      </MenuItem>
                    ))}
                  {form.branchCode && !branchCodeData.some((t) => String(t._id) === String(resolveSelectValue(branchCodeData, form.branchCode))) && (
                    <MenuItem key={String(form.branchCode)} value={String(form.branchCode)}>
                      {String(form.branchCode)}
                    </MenuItem>
                  )}
                </Select>
                {errors.branchCode && <FormHelperText>{errors.branchCode}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Branch Name"
                name="branchName"
                value={form.branchName}
                onChange={handleChange}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={!!errors.prefix}>
                <InputLabel id="prefix">Title</InputLabel>
                <Select
                  labelId="prefix"
                  label="prefix"
                  name="prefix"
                  value={resolveSelectValue(prefixData, form.prefix, ['prefix', 'name'])}
                  onChange={handleChange}
                >
                  {prefixData.length > 0 &&
                    prefixData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.prefix}
                      </MenuItem>
                    ))}
                  {form.prefix && !prefixData.some((t) => String(t._id) === String(resolveSelectValue(prefixData, form.prefix))) && (
                    <MenuItem key={String(form.prefix)} value={String(form.prefix)}>
                      {String(form.prefix)}
                    </MenuItem>
                  )}
                </Select>
                {errors.prefix && <FormHelperText>{errors.prefix}</FormHelperText>}
              </FormControl>
            </Grid>

            {[
              { label: 'Customer Name', name: 'cutomerName', required: true },
              { label: 'Customer Mobile', name: 'mobile' },
              { label: 'Customer Email', name: 'email' },
              { label: 'GST Number', name: 'gstNo' }
            ].map((field) => (
              <Grid item xs={12} sm={3} key={field.name}>
                <TextField
                  label={field.label}
                  name={field.name}
                  required={field.required || false}
                  value={form[field.name]}
                  onChange={handleChange}
                  error={!!errors[field.name]}
                  helperText={errors[field.name]}
                />
              </Grid>
            ))}
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={!!errors.insurerName}>
                <InputLabel id="insurerName-label" required>Insurer Company</InputLabel>
                <Select
                  labelId="insurerName-label"
                  name="insurerName"
                  value={form.insurerName || ''}
                  onChange={handleChange}
                  label="Insurer Company"
                >
                  {insCompanyData.length > 0 &&
                    insCompanyData.map((type) => {
                      const compName = type.insCompany || type.name || type.companyName || '';
                      return (
                        <MenuItem key={type._id} value={compName}>
                          {compName}
                        </MenuItem>
                      );
                    })}
                  {form.insurerName && !insCompanyData.some((t) => (t.insCompany || t.name || t.companyName) === form.insurerName) && (
                    <MenuItem key={String(form.insurerName)} value={String(form.insurerName)}>
                      {String(form.insurerName)}
                    </MenuItem>
                  )}
                </Select>
                {errors.insurerName && <FormHelperText>{errors.insurerName}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={<Checkbox name="nomineeDetailsCheckbox" checked={showNominee} onChange={handleCheckboxChange} />}
                label="Fill Nominee Details"
              />
            </Grid>

            {showNominee && (
              <>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Nominee Name"
                    name="nomineeName"
                    value={form.nomineeName}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Nominee Contact Number"
                    name="nomineeContact"
                    value={form.nomineeContact}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    label="Relation with Nominee"
                    name="nomineeRelation"
                    value={form.nomineeRelation}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  >
                    <MenuItem value="Son">Son</MenuItem>
                    <MenuItem value="Father">Fater</MenuItem>
                    <MenuItem value="Mother">Mother</MenuItem>
                    <MenuItem value="Spouse">Spouse</MenuItem>
                    <MenuItem value="Daughter">Daughter</MenuItem>
                    <MenuItem value="Sister">Sister</MenuItem>
                    <MenuItem value="Brother">Brother</MenuItem>
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={5}>
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          </Grid>
        </CardContent>
      </Card>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom>
        Policy Details
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.insDepartment}>
                <InputLabel id="insDepartment-label" required>
                  Department
                </InputLabel>

                <Select
                  labelId="insDepartment-label"
                  id="insDepartment"
                  name="insDepartment"
                  value={resolveSelectValue(insDepartmentData, form.insDepartment, ['insDepartment', 'name', 'departmentName'])}
                  label="Department"
                  onChange={handleChange}
                >
                  {insDepartmentData.length > 0 &&
                    insDepartmentData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.insDepartment}
                      </MenuItem>
                    ))}
                  {form.insDepartment && !insDepartmentData.some((t) => String(t._id) === String(resolveSelectValue(insDepartmentData, form.insDepartment))) && (
                    <MenuItem key={String(form.insDepartment)} value={String(form.insDepartment)}>
                      {String(form.insDepartment)}
                    </MenuItem>
                  )}
                </Select>

                {errors.insDepartment && <FormHelperText>{errors.insDepartment}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.product}>
                <InputLabel id="product" required>
                  Product
                </InputLabel>
                <Select
                  labelId="product"
                  label="product"
                  name="product"
                  value={resolveSelectValue(productData, form.product, ['productName', 'name'])}
                  onChange={handleChange}
                >
                  {productData.length > 0 &&
                    productData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.productName}
                      </MenuItem>
                    ))}
                  {form.product && !productData.some((t) => String(t._id) === String(resolveSelectValue(productData, form.product))) && (
                    <MenuItem key={String(form.product)} value={String(form.product)}>
                      {String(form.product)}
                    </MenuItem>
                  )}
                </Select>
                {errors.product && <FormHelperText>{errors.product}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="subProduct">Sub Product</InputLabel>
                <Select
                  labelId="subProduct"
                  label="subProduct"
                  name="subProduct"
                  value={resolveSelectValue(subProductData, form.subProduct, ['subproductName', 'subProductName', 'name'])}
                  onChange={handleChange}
                >
                  {subProductData?.length > 0 &&
                    subProductData?.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.subproductName || type.subProductName}
                      </MenuItem>
                    ))}
                  {form.subProduct && !subProductData.some((t) => String(t._id) === String(resolveSelectValue(subProductData, form.subProduct))) && (
                    <MenuItem key={String(form.subProduct)} value={String(form.subProduct)}>
                      {String(form.subProduct)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth error={!!errors.insCompany}>
                <InputLabel id="insCompany">Insurance Company</InputLabel>
                <Select
                  labelId="insCompany"
                  label="insCompany"
                  name="insCompany"
                  value={resolveSelectValue(insCompanyData, form.insCompany, ['insCompany', 'name', 'companyName'])}
                  onChange={handleChange}
                >
                  {insCompanyData.length > 0 &&
                    insCompanyData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.insCompany || type.name || type.companyName}
                      </MenuItem>
                    ))}
                  {form.insCompany && !insCompanyData.some((t) => String(t._id) === String(resolveSelectValue(insCompanyData, form.insCompany))) && (
                    <MenuItem key={String(form.insCompany)} value={String(form.insCompany)}>
                      {String(form.insCompany)}
                    </MenuItem>
                  )}
                </Select>
                {errors.insCompany && <FormHelperText>{errors.insCompany}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="brokerName">Broker Name</InputLabel>
                <Select
                  labelId="brokerName"
                  label="Broker Name"
                  name="brokerName"
                  value={resolveSelectValue(brokerNameData, form.brokerName, ['brokerName', 'name'])}
                  onChange={handleChange}
                >
                  {brokerNameData.length > 0 &&
                    brokerNameData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.brokerName}
                      </MenuItem>
                    ))}
                  {form.brokerName && !brokerNameData.some((t) => String(t._id) === String(resolveSelectValue(brokerNameData, form.brokerName))) && (
                    <MenuItem key={String(form.brokerName)} value={String(form.brokerName)}>
                      {String(form.brokerName)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="branchBroker">Broker Branch</InputLabel>
                <Select
                  labelId="branchBroker"
                  label="branchBroker"
                  name="branchBroker"
                  value={resolveSelectValue(branchBrokerData?.length > 0 ? branchBrokerData : branchCodeData, form.branchBroker, ['branchBroker', 'branchCode', 'branchName', 'name'])}
                  onChange={handleChange}
                >
                  {branchBrokerData?.length > 0 ? (
                    branchBrokerData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.branchBroker}
                      </MenuItem>
                    ))
                  ) : (
                    branchCodeData?.length > 0 &&
                    branchCodeData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.address ? `${type.address} (${type.branchName || type.branchCode})` : (type.branchName || type.branchCode)}
                      </MenuItem>
                    ))
                  )}
                  {form.branchBroker && !(branchBrokerData?.length > 0 ? branchBrokerData : branchCodeData).some((t) => String(t._id) === String(resolveSelectValue(branchBrokerData?.length > 0 ? branchBrokerData : branchCodeData, form.branchBroker))) && (
                    <MenuItem key={String(form.branchBroker)} value={String(form.branchBroker)}>
                      {String(form.branchBroker)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            {/* MOTOR */}
            {selectedDeptName.includes('motor') ? (
              <>
                <Typography variant="h5" sx={{ my: 2 }}>
                  TP Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth error={!!errors.tpPolicyDuration}>
                      <InputLabel id="tpPolicyDuration">Policy Duration</InputLabel>
                      <Select
                        labelId="tpPolicyDuration"
                        label="tpPolicyDuration"
                        name="tpPolicyDuration"
                        value={form.tpPolicyDuration}
                        onChange={handleChange}
                      >
                        <MenuItem value="YEARLY">YEARLY</MenuItem>
                        <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
                        <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                        <MenuItem value="DAYS">DAYS</MenuItem>
                        <MenuItem value="TILL END OF VOYAGE">TILL END OF VOYAGE</MenuItem>
                      </Select>
                      {errors.tpPolicyDuration && <FormHelperText>{errors.tpPolicyDuration}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      type="date"
                      label="Start Date"
                      value={form.tpStartDate}
                      name="tpStartDate"
                      onChange={handleChange}
                      fullWidth
                      error={!!errors.tpStartDate}
                      helperText={errors.tpStartDate}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      type={form.tpEndDate === 'TILL END OF VOYAGE' ? 'text' : 'date'}
                      label="End Date"
                      value={form.tpEndDate}
                      name="tpEndDate"
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="TP Premium"
                      value={form.tpPremium}
                      onChange={handleChange}
                      name="tpPremium"
                      fullWidth
                      error={!!errors.tpPremium}
                      helperText={errors.tpPremium}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <FormControl fullWidth>
                      <InputLabel id="tpGst">GST</InputLabel>
                      <Select
                        labelId="tpGst"
                        label="tpGst"
                        name="tpGst"
                        value={resolveSelectValue(gstData, form.tpGst || form.gst, ['value'])}
                        onChange={handleChange}
                        disabled={selectedDeptName.toLowerCase().includes('travel')}
                      >
                        {gstData.length > 0 &&
                          gstData.map((type) => (
                            <MenuItem key={type._id} value={type._id}>
                              {type.value}
                            </MenuItem>
                          ))}
                        {(form.tpGst || form.gst) && !gstData.some((t) => String(t._id) === String(resolveSelectValue(gstData, form.tpGst || form.gst))) && (
                          <MenuItem key={String(form.tpGst || form.gst)} value={String(form.tpGst || form.gst)}>
                            {policyData?.tpGst?.value || policyData?.gst?.value || String(form.tpGst || form.gst)}
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      label="TP GST"
                      onChange={handleChange}
                      value={form.tpGstAmount || ''}
                      name="tpGstAmount"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="TP Amount"
                      onChange={handleChange}
                      value={form.tpAmount || ''}
                      name="tpAmount"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Typography variant="h5" sx={{ my: 2 }}>
                  OD Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={2}>
                    <FormControl fullWidth error={!!errors.odPolicyDuration}>
                      <InputLabel id="odPolicyDuration">Policy Duration</InputLabel>
                      <Select
                        labelId="odPolicyDuration"
                        label="odPolicyDuration"
                        name="odPolicyDuration"
                        value={form.odPolicyDuration || 'YEARLY'}
                        onChange={handleChange}
                      >
                        <MenuItem value="YEARLY">YEARLY</MenuItem>
                        <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
                        <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                        <MenuItem value="DAYS">DAYS</MenuItem>
                        <MenuItem value="TILL END OF VOYAGE">TILL END OF VOYAGE</MenuItem>
                      </Select>
                      {errors.odPolicyDuration && <FormHelperText>{errors.odPolicyDuration}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      type="date"
                      label="Start Date"
                      value={form.odStartDate}
                      onChange={handleChange}
                      name="odStartDate"
                      fullWidth
                      error={!!errors.odStartDate}
                      helperText={errors.odStartDate}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      type={form.odEndDate === 'TILL END OF VOYAGE' ? 'text' : 'date'}
                      label="End Date"
                      value={form.odEndDate}
                      onChange={handleChange}
                      name="odEndDate"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="OD Premium"
                      value={form.odPremium}
                      onChange={handleChange}
                      name="odPremium"
                      fullWidth
                      error={!!errors.odPremium}
                      helperText={errors.odPremium}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <FormControl fullWidth>
                      <InputLabel id="odGst">GST</InputLabel>
                      <Select
                        labelId="odGst"
                        label="odGst"
                        name="odGst"
                        value={resolveSelectValue(gstData, form.odGst || form.gst, ['value'])}
                        onChange={handleChange}
                        disabled={selectedDeptName.toLowerCase().includes('travel')}
                      >
                        {gstData.length > 0 &&
                          gstData.map((type) => (
                            <MenuItem key={type._id} value={type._id}>
                              {type.value}
                            </MenuItem>
                          ))}
                        {(form.odGst || form.gst) && !gstData.some((t) => String(t._id) === String(resolveSelectValue(gstData, form.odGst || form.gst))) && (
                          <MenuItem key={String(form.odGst || form.gst)} value={String(form.odGst || form.gst)}>
                            {policyData?.odGst?.value || policyData?.gst?.value || String(form.odGst || form.gst)}
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      label="OD GST"
                      onChange={handleChange}
                      value={form.odGstAmount || ''}
                      name="odGstAmount"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="OD Amount"
                      onChange={handleChange}
                      value={form.odAmount || ''}
                      name="odAmount"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Typography variant="h5" sx={{ my: 2, color: 'primary.main' }}>
                  TP + OD Summary
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="TP + OD Net Premium"
                      value={form.netPremium || ''}
                      onChange={handleChange}
                      name="netPremium"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="TP + OD GST Amount"
                      value={form.gstAmount || ''}
                      onChange={handleChange}
                      name="gstAmount"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="TP + OD Total Amount"
                      value={form.totalAmount || ''}
                      onChange={handleChange}
                      name="totalAmount"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth error={!!errors.policyDuration}>
                    <InputLabel id="policyDuration">Policy Duration</InputLabel>
                    <Select
                      labelId="policyDuration"
                      label="policyDuration"
                      name="policyDuration"
                      onChange={handleChange}
                      value={form.policyDuration}
                    >
                      <MenuItem value="YEARLY">YEARLY</MenuItem>
                      <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
                      <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                      <MenuItem value="DAYS">DAYS</MenuItem>
                      <MenuItem value="TILL END OF VOYAGE">TILL END OF VOYAGE</MenuItem>
                    </Select>
                    {errors.policyDuration && <FormHelperText>{errors.policyDuration}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="date"
                    label="Start Date"
                    value={form.startDate}
                    onChange={handleChange}
                    name="startDate"
                    fullWidth
                    error={!!errors.startDate}
                    helperText={errors.startDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type={form.endDate === 'TILL END OF VOYAGE' ? 'text' : 'date'}
                    label="End Date"
                    value={form.endDate}
                    onChange={handleChange}
                    name="endDate"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={3}>
              <TextField
                type={form.renewalDate === 'TILL END OF VOYAGE' ? 'text' : 'date'}
                label="Renewal Date"
                name="renewalDate"
                fullWidth
                value={form.renewalDate}
                onChange={handleChange}
                error={!!errors.renewalDate}
                helperText={errors.renewalDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {/* MOTOR */}
            {selectedDeptName.includes('motor') && (
              <>
                <Grid item xs={12} sm={9}></Grid>
              </>
            )}
            <Grid item xs={12} sm={3}>
              <TextField
                label="Policy Number"
                name="policyNumber"
                fullWidth
                value={form.policyNumber}
                onChange={handleChange}
                error={!!errors.policyNumber}
                helperText={errors.policyNumber}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="renewable">Renewable</InputLabel>
                <Select labelId="renewable" label="renewable" name="renewable" value={form.renewable} onChange={handleChange}>
                  <MenuItem value="RENEWAL">RENEWAL</MenuItem>
                  <MenuItem value="NEW BUSINESS">NEW BUSINESS</MenuItem>
                  <MenuItem value="PORTABILITY">PORTABILITY</MenuItem>
                  <MenuItem value="ROLLOVER">ROLLOVER</MenuItem>
                  <MenuItem value="ENDORSEMENT">ENDORSEMENT</MenuItem>
                  <MenuItem value="NEW">NEW</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="riskCode">Risk Code</InputLabel>
                <Select
                  labelId="riskCode"
                  label="riskCode"
                  name="riskCode"
                  value={resolveSelectValue(riskCodeData, form.riskCode, ['riskCode', 'code'])}
                  onChange={handleChange}
                >
                  {riskCodeData.length > 0 &&
                    riskCodeData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.riskCode}
                      </MenuItem>
                    ))}
                  {form.riskCode && !riskCodeData.some((t) => String(t._id) === String(resolveSelectValue(riskCodeData, form.riskCode))) && (
                    <MenuItem key={String(form.riskCode)} value={String(form.riskCode)}>
                      {String(form.riskCode)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Sum Insured"
                name="sumInsured"
                value={form.sumInsured}
                onChange={handleChange}
                fullWidth
                error={!!errors.sumInsured}
                helperText={errors.sumInsured}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {(selectedDeptName === 'engineering' ||
              selectedDeptName === 'fire' ||
              selectedDeptName === 'health') && (
              <>
                {selectedDeptName !== 'health' && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label={siteLocation}
                      name="Site Location"
                      value={form.siteLocation}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
                <Grid item xs={12} sm={selectedDeptName === 'health' ? 3 : 4}>
                  <TextField
                    label="Number of Premium Installments"
                    name="numberOfInstallments"
                    value={form.numberOfInstallments}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={selectedDeptName === 'health' ? 3 : 4}>
                  <TextField
                    type="date"
                    label="Next Installment Due Date"
                    name="nextInstallmentDate"
                    value={form.nextInstallmentDate}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                {selectedDeptName === 'health' && (
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Number of Lives Cover"
                      name="livesCover"
                      value={form.livesCover}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                )}
              </>
            )}
            {selectedDeptName === 'liability' && (
              <>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Occupation"
                    name="occupation"
                    value={form.occupation}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="date"
                    label="Retroactive Date"
                    name="retroActive"
                    value={form.retroActive}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            {(selectedDeptName === 'marine' || selectedDeptName === 'misc') && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="incoterms">Incoterms</InputLabel>
                  <Select
                    labelId="incoterms"
                    label="incoterms"
                    name="incoterms"
                    value={resolveSelectValue(incotermsData, form.incoterms, ['incoterms', 'name'])}
                    onChange={handleChange}
                  >
                    {incotermsData.length > 0 &&
                      incotermsData.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.incoterms}
                        </MenuItem>
                      ))}
                    {form.incoterms && !incotermsData.some((t) => String(t._id) === String(resolveSelectValue(incotermsData, form.incoterms))) && (
                      <MenuItem key={String(form.incoterms)} value={String(form.incoterms)}>
                        {String(form.incoterms)}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}
            {selectedDeptName === 'marine' && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="marineClause">Marine Cargo Clause</InputLabel>
                  <Select labelId="marineClause" label="marineClause" name="marineClause" value={form.marineClause || ''} onChange={handleChange}>
                    <MenuItem value="Mr">INSTITITE CARGO CLAUSE A</MenuItem>
                    <MenuItem value="Mrs">INSTITITE CARGO CLAUSE B</MenuItem>
                    <MenuItem value="Mrs">INSTITITE CARGO CLAUSE C</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={2}>
              <TextField
                label="Terrorism"
                name="terrorism"
                fullWidth
                value={form.terrorism}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Premium other than Terrorism"
                name="permiumOtherThanTerrorism"
                value={form.permiumOtherThanTerrorism}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth>
                <InputLabel id="otherAddon">Other Addon</InputLabel>
                <Select
                  labelId="otherAddon"
                  label="otherAddon"
                  name="otherAddon"
                  value={resolveSelectValue(addonData, form.otherAddon, ['otherAddon', 'name'])}
                  onChange={handleChange}
                >
                  {addonData.length > 0 &&
                    addonData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.otherAddon}
                      </MenuItem>
                    ))}
                  {form.otherAddon && !addonData.some((t) => String(t._id) === String(resolveSelectValue(addonData, form.otherAddon))) && (
                    <MenuItem key={String(form.otherAddon)} value={String(form.otherAddon)}>
                      {String(form.otherAddon)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* MOTOR */}
      {selectedDeptName === 'motor' ? (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" gutterBottom>
            Motor Details
          </Typography>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Vehicle Make"
                    name="vehicleMake"
                    value={form.vehicleMake}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Vehicle Model"
                    name="vehicleModel"
                    value={form.vehicleModel}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Vehicle Sub Model"
                    name="vehicleSubModel"
                    value={form.vehicleSubModel}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Vehicle Number"
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Engine Number"
                    name="engineNumber"
                    value={form.engineNumber}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="month"
                    label="Month/Year of REGN"
                    name="monthYearOfRegn"
                    value={form.monthYearOfRegn}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="fuelType">Fuel Type</InputLabel>
                    <Select
                      labelId="fuelType"
                      label="fuelType"
                      name="fuelType"
                      value={resolveSelectValue(fuelTypeData, form.fuelType, ['fuelType', 'name'])}
                      onChange={handleChange}
                    >
                      {fuelTypeData.length > 0 &&
                        fuelTypeData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.fuelType}
                          </MenuItem>
                        ))}
                      {form.fuelType && !fuelTypeData.some((t) => String(t._id) === String(resolveSelectValue(fuelTypeData, form.fuelType))) && (
                        <MenuItem key={String(form.fuelType)} value={String(form.fuelType)}>
                          {String(form.fuelType)}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth>
                    <InputLabel id="yearOfManufacturing">Year of Manufacturing</InputLabel>
                    <Select
                      labelId="yearOfManufacturing"
                      label="yearOfManufacturing"
                      name="yearOfManufacturing"
                      value={form.yearOfManufacturing || ''}
                      onChange={handleChange}
                    >
                      <MenuItem value="2009">2009</MenuItem>
                      <MenuItem value="2010">2010</MenuItem>
                      <MenuItem value="2011">2011</MenuItem>
                      <MenuItem value="2012">2012</MenuItem>
                      <MenuItem value="2013">2013</MenuItem>
                      <MenuItem value="2014">2014</MenuItem>
                      <MenuItem value="2015">2015</MenuItem>
                      <MenuItem value="2016">2016</MenuItem>
                      <MenuItem value="2017">2017</MenuItem>
                      <MenuItem value="2018">2018</MenuItem>
                      <MenuItem value="2019">2019</MenuItem>
                      <MenuItem value="2020">2020</MenuItem>
                      <MenuItem value="2021">2021</MenuItem>
                      <MenuItem value="2022">2022</MenuItem>
                      <MenuItem value="2023">2023</MenuItem>
                      <MenuItem value="2024">2024</MenuItem>
                      <MenuItem value="2025">2025</MenuItem>
                      <MenuItem value="2026">2026</MenuItem>
                      <MenuItem value="2027">2027</MenuItem>
                      {form.yearOfManufacturing && !['2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025','2026','2027'].includes(String(form.yearOfManufacturing)) && (
                        <MenuItem key={String(form.yearOfManufacturing)} value={String(form.yearOfManufacturing)}>
                          {String(form.yearOfManufacturing)}
                        </MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Chassis Number"
                    name="chassisNumber"
                    value={form.chassisNumber}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : (
        <></>
      )}
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom>
        Endorsement Details
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Endorsement Name"
                name="endorsementName"
                value={form.endorsementName}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={9}>
              <FormControl fullWidth>
                <InputLabel id="endorsementReason">Endorsement Reason</InputLabel>
                <Select
                  labelId="endorsementReason"
                  label="endorsementReason"
                  name="endorsementReason"
                  value={resolveSelectValue(endorsementData, form.endorsementReason, ['endorsement', 'reason'])}
                  onChange={handleChange}
                >
                  {endorsementData.length > 0 &&
                    endorsementData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.endorsement}
                      </MenuItem>
                    ))}
                  {form.endorsementReason && !endorsementData.some((t) => String(t._id) === String(resolveSelectValue(endorsementData, form.endorsementReason))) && (
                    <MenuItem key={String(form.endorsementReason)} value={String(form.endorsementReason)}>
                      {String(form.endorsementReason)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Endorsement Policy Number"
                name="endorsementPolicyNumber"
                value={form.endorsementPolicyNumber}
                onChange={handleChange}
                onBlur={(e) => handleFetchEndorsementPolicy(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="Start Date"
                value={form.endorStartDate}
                name="endorStartDate"
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                type="date"
                label="End Date"
                value={form.endorEndDate}
                onChange={handleChange}
                name="endorEndDate"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Endorsement Terrorism"
                value={form.endorsementTerrorism}
                name="endorsementTerrorism"
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Endorsement Other Terrorism"
                value={form.endorsementOtherTerrorism}
                name="endorsementOtherTerrorism"
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Endorsement Net Premium"
                value={form.endorsementNetPremium}
                name="endorsementNetPremium"
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="endorsementGst">Endorsement GST</InputLabel>
                <Select
                  labelId="endorsementGst"
                  label="Endorsement GST"
                  name="endorsementGst"
                  value={resolveSelectValue(gstData, form.endorsementGst, ['value'])}
                  onChange={handleChange}
                >
                  {gstData.length > 0 &&
                    gstData.map((type) => (
                      <MenuItem key={type._id} value={type._id}>
                        {type.value}
                      </MenuItem>
                    ))}
                  {form.endorsementGst && !gstData.some((t) => String(t._id) === String(resolveSelectValue(gstData, form.endorsementGst))) && (
                    <MenuItem key={String(form.endorsementGst)} value={String(form.endorsementGst)}>
                      {policyData?.endorsementGst?.value || String(form.endorsementGst)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Endorsement GST Amt"
                onChange={handleChange}
                value={form.endorsementGstAmount}
                name="endorsementGstAmount"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Endorsement Total Amount"
                onChange={handleChange}
                name="etotalAmount"
                value={form.etotalAmount}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom>
        Payment Details
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth error={!!errors.paymentMode}>
                <InputLabel id="paymentMode">Payment Mode</InputLabel>
                <Select
                  labelId="paymentMode"
                  label="paymentMode"
                  name="paymentMode"
                  value={form.paymentMode ? String(form.paymentMode).toUpperCase().trim() : ''}
                  onChange={handleChange}
                >
                  {paymentModeData && paymentModeData.length > 0 ? (
                    paymentModeData.map((type) => (
                      <MenuItem key={type._id || type.paymentMode} value={String(type.paymentMode).toUpperCase().trim()}>
                        {String(type.paymentMode).toUpperCase().trim()}
                      </MenuItem>
                    ))
                  ) : (
                    ['ONLINE', 'CASH', 'CHEQUE', 'NEFT', 'RTGS', 'UPI'].map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {mode}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.paymentMode && <FormHelperText>{errors.paymentMode}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Paid Amount"
                value={form.paidAmount}
                onChange={handleChange}
                name="paidAmount"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {form.paymentMode === 'CHEQUE' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Cheque No."
                  value={form.chequeNo}
                  onChange={handleChange}
                  name="chequeNo"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="Transaction Date"
                value={form.transactionDate}
                onChange={handleChange}
                name="transactionDate"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" onClick={handleSubmit}>
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom>
        Servicing Details
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="POS MIS REF"
                value={form.posMisRef}
                onChange={handleChange}
                name="posMisRef"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="BQP Code"
                value={form.bqpCode}
                onChange={handleChange}
                name="bqpCode"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Button variant="contained" onClick={handleSubmit}>
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom></Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <RadioGroup row value={brokerageValue} onChange={handleBrokerage}>
                <FormControlLabel value="brokerage" control={<Radio />} label="Brokerage Details" />
                <FormControlLabel value="endorsement" control={<Radio />} label="Endorsement Details" />
              </RadioGroup>
            </Grid>
            {/* <Grid item xs={12}>
                        <RadioGroup row value={leadCategory} onChange={(e) => setLeadCategory(e.target.value)}>
                          <FormControlLabel value="prospect" control={<Radio />} label="Prospect" />
                          <FormControlLabel value="client" control={<Radio />} label="Client" />
                          <FormControlLabel value="newLead" control={<Radio />} label="New Lead" />
                        </RadioGroup>
                      </Grid> */}

            {selectedDeptName === 'motor' ? (
              <>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth error={!!errors.tpBrokerageRate}>
                    <InputLabel id="tpBrokerageRate">TP Brokerage Rate</InputLabel>
                    <Select
                      labelId="tpBrokerageRate"
                      label="TP Brokerage Rate"
                      name="tpBrokerageRate"
                      value={resolveSelectValue(brokerageRateData, form.tpBrokerageRate, ['brokerageRate'])}
                      onChange={handleChange}
                    >
                      {brokerageRateData && brokerageRateData.length > 0 ? (
                        brokerageRateData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.brokerageRate}%
                          </MenuItem>
                        ))
                      ) : (
                        [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25].map((rate) => (
                          <MenuItem key={rate} value={String(rate)}>
                            {rate}%
                          </MenuItem>
                        ))
                      )}
                      {form.tpBrokerageRate && !brokerageRateData.some((t) => String(t._id) === String(resolveSelectValue(brokerageRateData, form.tpBrokerageRate))) && (
                        <MenuItem key={String(form.tpBrokerageRate)} value={String(form.tpBrokerageRate)}>
                          {String(form.tpBrokerageRate)}%
                        </MenuItem>
                      )}
                    </Select>
                    {errors.tpBrokerageRate && <FormHelperText>{errors.tpBrokerageRate}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="TP Brokerage Amount"
                    name="tpBrokerageAmount"
                    value={form.tpBrokerageAmount || ''}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth error={!!errors.odBrokerageRate}>
                    <InputLabel id="odBrokerageRate">OD Brokerage Rate</InputLabel>
                    <Select
                      labelId="odBrokerageRate"
                      label="OD Brokerage Rate"
                      name="odBrokerageRate"
                      value={resolveSelectValue(brokerageRateData, form.odBrokerageRate, ['brokerageRate'])}
                      onChange={handleChange}
                    >
                      {brokerageRateData && brokerageRateData.length > 0 ? (
                        brokerageRateData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.brokerageRate}%
                          </MenuItem>
                        ))
                      ) : (
                        [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25].map((rate) => (
                          <MenuItem key={rate} value={String(rate)}>
                            {rate}%
                          </MenuItem>
                        ))
                      )}
                      {form.odBrokerageRate && !brokerageRateData.some((t) => String(t._id) === String(resolveSelectValue(brokerageRateData, form.odBrokerageRate))) && (
                        <MenuItem key={String(form.odBrokerageRate)} value={String(form.odBrokerageRate)}>
                          {String(form.odBrokerageRate)}%
                        </MenuItem>
                      )}
                    </Select>
                    {errors.odBrokerageRate && <FormHelperText>{errors.odBrokerageRate}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="OD Brokerage Amount"
                    name="odBrokerageAmount"
                    value={form.odBrokerageAmount || ''}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth error={!!errors.rateOnTerr}>
                    <InputLabel id="rateOnTerr">
                      {brokerageValue === 'brokerage' ? 'Rate on Terrorism' : 'Endorsement Rate on Terrorism'}
                    </InputLabel>
                    <Select
                      labelId="rateOnTerr"
                      label="rateOnTerr"
                      name="rateOnTerr"
                      value={resolveSelectValue(brokerageRateData, form.rateOnTerr, ['brokerageRate'])}
                      onChange={handleChange}
                    >
                      {brokerageRateData && brokerageRateData.length > 0 ? (
                        brokerageRateData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.brokerageRate}%
                          </MenuItem>
                        ))
                      ) : (
                        [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25].map((rate) => (
                          <MenuItem key={rate} value={String(rate)}>
                            {rate}%
                          </MenuItem>
                        ))
                      )}
                      {form.rateOnTerr && !brokerageRateData.some((t) => String(t._id) === String(resolveSelectValue(brokerageRateData, form.rateOnTerr))) && (
                        <MenuItem key={String(form.rateOnTerr)} value={String(form.rateOnTerr)}>
                          {String(form.rateOnTerr)}%
                        </MenuItem>
                      )}
                    </Select>
                    {errors.rateOnTerr && <FormHelperText>{errors.rateOnTerr}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label={brokerageValue === 'brokerage' ? 'Amount on Terrorism' : 'Endorsement Amount on Terrorism'}
                    name="amountOnTerr"
                    value={form.amountOnTerr}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth error={!!errors.rateOnOtherTerr}>
                    <InputLabel id="rateOnOtherTerr">
                      {brokerageValue === 'brokerage' ? 'Rate on Other Terrorism' : 'Endorsement Rate on Other Terrorism'}
                    </InputLabel>
                    <Select
                      labelId="rateOnOtherTerr"
                      label="rateOnOtherTerr"
                      name="rateOnOtherTerr"
                      value={resolveSelectValue(brokerageRateData, form.rateOnOtherTerr, ['brokerageRate'])}
                      onChange={handleChange}
                    >
                      {brokerageRateData && brokerageRateData.length > 0 ? (
                        brokerageRateData.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.brokerageRate}%
                          </MenuItem>
                        ))
                      ) : (
                        [0, 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25].map((rate) => (
                          <MenuItem key={rate} value={String(rate)}>
                            {rate}%
                          </MenuItem>
                        ))
                      )}
                      {form.rateOnOtherTerr && !brokerageRateData.some((t) => String(t._id) === String(resolveSelectValue(brokerageRateData, form.rateOnOtherTerr))) && (
                        <MenuItem key={String(form.rateOnOtherTerr)} value={String(form.rateOnOtherTerr)}>
                          {String(form.rateOnOtherTerr)}%
                        </MenuItem>
                      )}
                    </Select>
                    {errors.rateOnOtherTerr && <FormHelperText>{errors.rateOnOtherTerr}</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label={brokerageValue === 'brokerage' ? 'Amount on other Terrorism' : 'Endorsement Amount on other Terrorism'}
                    name="amountOnOtherTerr"
                    value={form.amountOnOtherTerr}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={3}>
              <TextField
                label={brokerageValue === 'brokerage' ? 'Total Brokerage Amount' : 'Endorsement Total Brokerage Amount'}
                name="totalBrokerageAmount"
                value={form.totalBrokerageAmount}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="totalBrokerageGst">
                  {brokerageValue === 'brokerage' ? 'Total Brokerage GST%' : 'Endorsement Total Brokerage GST%'}
                </InputLabel>
                <Select
                  labelId="totalBrokerageGst"
                  label={brokerageValue === 'brokerage' ? 'Total Brokerage GST%' : 'Endorsement Total Brokerage GST%'}
                  name="totalBrokerageGst"
                  value={form.totalBrokerageGst || ''}
                  onChange={handleChange}
                >
                  {gstData.length > 0 &&
                    gstData.map((type) => (
                      <MenuItem key={type._id} value={type.value}>
                        {type.value}
                      </MenuItem>
                    ))}
                  {form.totalBrokerageGst && !gstData.some((t) => String(t.value) === String(form.totalBrokerageGst)) && (
                    <MenuItem key={String(form.totalBrokerageGst)} value={form.totalBrokerageGst}>
                      {String(form.totalBrokerageGst)}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label={brokerageValue === 'brokerage' ? 'Total Brokerage Amount inc GST' : 'Endorsement Total Brokerage Amount inc GST'}
                name="totalBrokerageAmountincGst"
                value={form.totalBrokerageAmountincGst}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showCoBrokerage}
                    onChange={(e) => setShowCoBrokerage(e.target.checked)}
                    name="coBrockerageDetails"
                  />
                }
                label="Co-Brokerage Details"
              />
            </Grid>
            {showCoBrokerage && (
              <>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Share Percentage"
                    name="sharePercentage"
                    type="number"
                    value={form.sharePercentage}
                    onChange={handleChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Co-Brokerage Amount"
                    name="coBrokerageAmount"
                    type="number"
                    value={form.coBrokerageAmount}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      readOnly: true
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />
      <Typography variant="h5" gutterBottom>
        GST & Premium Summary
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label={selectedDeptName === 'motor' ? "TP + OD Net Premium" : "Net Premium"}
                name="netPremium"
                onChange={handleChange}
                value={form.netPremium}
                fullWidth
                error={!!errors.netPremium}
                helperText={errors.netPremium}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {selectedDeptName !== 'motor' && (
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel id="gst">GST</InputLabel>
                  <Select
                    labelId="gst"
                    label="gst"
                    name="gst"
                    value={resolveSelectValue(gstData, form.gst, ['value'])}
                    onChange={handleChange}
                    disabled={selectedDeptName.toLowerCase().includes('travel')}
                  >
                    {gstData.length > 0 &&
                      gstData.map((type) => (
                        <MenuItem key={type._id} value={type._id}>
                          {type.value}
                        </MenuItem>
                      ))}
                    {form.gst && !gstData.some((t) => String(t._id) === String(resolveSelectValue(gstData, form.gst))) && (
                      <MenuItem key={String(form.gst)} value={String(form.gst)}>
                        {policyData?.gst?.value || String(form.gst)}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={3}>
              <TextField
                label={selectedDeptName === 'motor' ? "TP + OD GST Amt" : "GST Amt"}
                onChange={handleChange}
                value={form.gstAmount || ''}
                name="gstAmount"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label={selectedDeptName === 'motor' ? "TP + OD Total Amount" : "Total Amount"}
                name="totalAmount"
                value={form.totalAmount || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button variant="contained" sx={{ mr: 2 }} onClick={handleSubmit}>
            Submit
          </Button>
          <Button variant="contained" sx={{ backgroundColor: 'grey', mr: 2 }} onClick={() => navigate('/policy')}>
            Close
          </Button>
          <Button variant="contained" sx={{ backgroundColor: 'orange' }} onClick={() => setForm(initialState())}>
            Clear
          </Button>
        </Grid>
      </Grid>
      <ToastContainer />
    </div>
  );
};

export default EditPolicy;
