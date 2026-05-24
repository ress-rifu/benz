"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn");
  const [isClient, setIsClient] = useState(false);

  // Initialize from localStorage on client side
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem("language") as Language;
    if (stored && (stored === "bn" || stored === "en")) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (isClient) {
      localStorage.setItem("language", lang);
    }
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing: ${key}`);
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

// Translation dictionaries
const translations = {
  bn: {
    // Common
    common: {
      search: "খুঁজুন",
      clear: "মুছুন",
      loading: "লোড হচ্ছে...",
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      delete: "মুছে ফেলুন",
      edit: "সম্পাদনা করুন",
      create: "তৈরি করুন",
      update: "আপডেট করুন",
      actions: "কার্যক্রম",
      status: "স্ট্যাটাস",
      total: "মোট",
      paid: "পরিশোধিত",
      due: "বাকি",
      yes: "হ্যাঁ",
      no: "না",
      logout: "লগআউট",
    },
    
    // Dashboard
    dashboard: {
      title: "ড্যাশবোর্ড",
      monthlyRevenue: "মাসিক আয়",
      weeklyRevenue: "সাপ্তাহিক আয়",
      totalRevenue: "মোট আয়",
      outstandingBalance: "বাকি আছে",
      invoices: "ইনভয়েস",
      quotations: "কোটেশন",
      customers: "গ্রাহক",
      parts: "পার্টস",
      services: "সার্ভিস",
      sales: "বিক্রয়",
      admins: "এডমিন",
      categories: "ক্যাটাগরি",
      settings: "সেটিংস",
      welcome: "বেনজ অটোমোবাইল ম্যানেজমেন্ট সিস্টেমে আপনাকে স্বাগতম",
      lowStockAlert: "কম স্টক অ্যালার্ট",
      allTime: "সর্বকালের",
      revenueLast7Days: "রাজস্ব (গত ৭ দিন)",
      recentInvoices: "সাম্প্রতিক ইনভয়েস",
      noInvoices: "এখনো কোনো ইনভয়েস নেই",
      vsLastMonth: "গত মাসের তুলনায়",
      paidInvoicesLast7Days: "পরিশোধিত ইনভয়েস, গত ৭ দিন",
      allPaidInvoices: "সকল পরিশোধিত ইনভয়েস",
      dueInvoices: "বকেয়া ইনভয়েস",
      inventoryValueCost: "ইনভেন্টরি মূল্য (ক্রয়)",
      sumPartsCostPrice: "পার্টস ক্রয়ের মোট মূল্য",
    },
    
    // Invoices
    invoices: {
      title: "ইনভয়েস",
      createNew: "নতুন ইনভয়েস তৈরি করুন",
      searchPlaceholder: "ইনভয়েস নম্বর, গ্রাহক বা গাড়ি খুঁজুন...",
      invoiceNumber: "ইনভয়েস নম্বর",
      customer: "গ্রাহক",
      vehicle: "গাড়ি",
      date: "তারিখ",
      amount: "পরিমাণ",
      markAsPaid: "পরিশোধিত চিহ্নিত করুন",
      viewInvoice: "ইনভয়েস দেখুন",
      printInvoice: "প্রিন্ট করুন",
      noInvoices: "এখনো কোনো ইনভয়েস নেই",
      noInvoicesDesc: "প্রথম ইনভয়েস তৈরি করুন",
      noResults: "কোনো ইনভয়েস পাওয়া যায়নি",
      noResultsDesc: "অন্য শব্দ দিয়ে খুঁজুন",
      confirmMarkPaid: "পরিশোধিত হিসেবে চিহ্নিত করবেন?",
      confirmMarkPaidDesc: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না",
      alreadyPaid: "ইতিমধ্যে পরিশোধিত",
      statusUpdated: "স্ট্যাটাস আপডেট হয়েছে",
    },
    
    // Quotations
    quotations: {
      title: "কোটেশন",
      createNew: "নতুন কোটেশন তৈরি করুন",
      searchPlaceholder: "কোটেশন নম্বর, গ্রাহক বা গাড়ি খুঁজুন...",
      quotationNumber: "কোটেশন নম্বর",
      customer: "গ্রাহক",
      vehicle: "গাড়ি",
      date: "তারিখ",
      amount: "পরিমাণ",
      viewQuotation: "কোটেশন দেখুন",
      editQuotation: "কোটেশন সম্পাদনা করুন",
      printQuotation: "প্রিন্ট করুন",
      noQuotations: "এখনো কোনো কোটেশন নেই",
      noQuotationsDesc: "প্রথম কোটেশন তৈরি করুন",
      noResults: "কোনো কোটেশন পাওয়া যায়নি",
      noResultsDesc: "অন্য শব্দ দিয়ে খুঁজুন",
      deleteConfirm: "কোটেশন মুছে ফেলবেন?",
      deleteConfirmDesc: "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না",
    },
    
    // Customers
    customers: {
      title: "গ্রাহক",
      createNew: "নতুন গ্রাহক যোগ করুন",
      searchPlaceholder: "নাম, ফোন বা ইমেইল খুঁজুন...",
      name: "নাম",
      phone: "ফোন",
      email: "ইমেইল",
      address: "ঠিকানা",
      totalDue: "মোট বাকি",
      totalPaid: "মোট পরিশোধিত",
      hasOutstanding: "বাকি আছে",
      noCustomers: "এখনো কোনো গ্রাহক নেই",
      noCustomersDesc: "প্রথম গ্রাহক যোগ করুন",
      noResults: "কোনো গ্রাহক পাওয়া যায়নি",
      noResultsDesc: "অন্য শব্দ দিয়ে খুঁজুন",
    },
    
    // Sales
    sales: {
      title: "বিক্রয়",
      totalRevenue: "মোট আয়",
      totalSales: "মোট বিক্রয়",
      averageInvoice: "গড় ইনভয়েস মূল্য",
      salesListing: "বিক্রয় তালিকা",
      filterToday: "আজকে",
      filterWeek: "এই সপ্তাহ",
      filterMonth: "এই মাস",
      filterCustom: "কাস্টম রেঞ্জ",
      forPeriod: "নির্বাচিত সময়ের জন্য",
      invoicesGenerated: "ইনভয়েস তৈরি হয়েছে",
      perInvoice: "প্রতি ইনভয়েস",
      loadingSales: "বিক্রয় তথ্য লোড হচ্ছে...",
      searchPlaceholder: "ইনভয়েস নম্বর বা গ্রাহকের নাম খুঁজুন...",
    },
    
    // Parts
    parts: {
      title: "পার্টস",
      createNew: "নতুন পার্ট যোগ করুন",
      partName: "পার্টের নাম",
      category: "ক্যাটাগরি",
      brand: "ব্র্যান্ড",
      price: "মূল্য",
      stock: "স্টক",
      inStock: "স্টকে আছে",
      outOfStock: "স্টকে নেই",
      noParts: "এখনো কোনো পার্ট নেই",
      noPartsDesc: "প্রথম পার্ট যোগ করুন",
      searchPlaceholder: "নাম, SKU বা পার্ট নম্বর খুঁজুন...",
    },
    
    // Services
    services: {
      title: "সার্ভিস",
      createNew: "নতুন সার্ভিস যোগ করুন",
      serviceName: "সার্ভিসের নাম",
      category: "ক্যাটাগরি",
      price: "মূল্য",
      duration: "সময়কাল",
      noServices: "এখনো কোনো সার্ভিস নেই",
      noServicesDesc: "প্রথম সার্ভিস যোগ করুন",
    },
    
    // Categories
    categories: {
      title: "ক্যাটাগরি",
      partCategories: "পার্ট ক্যাটাগরি",
      partBrands: "পার্ট ব্র্যান্ড",
      serviceCategories: "সার্ভিস ক্যাটাগরি",
      createPartCategory: "পার্ট ক্যাটাগরি তৈরি করুন",
      createPartBrand: "পার্ট ব্র্যান্ড তৈরি করুন",
      createServiceCategory: "সার্ভিস ক্যাটাগরি তৈরি করুন",
      categoryName: "ক্যাটাগরির নাম",
      brandName: "ব্র্যান্ডের নাম",
      noCategories: "এখনো কোনো ক্যাটাগরি নেই",
      noCategoriesDesc: "প্রথম ক্যাটাগরি তৈরি করুন",
    },
    
    // Admins
    admins: {
      title: "এডমিন",
      createNew: "নতুন এডমিন যোগ করুন",
      email: "ইমেইল",
      role: "রোল",
      superAdmin: "সুপার এডমিন",
      admin: "এডমিন",
      noAdmins: "এখনো কোনো এডমিন নেই",
      noAdminsDesc: "প্রথম এডমিন যোগ করুন",
    },
    
    // Auth
    auth: {
      login: "লগইন করুন",
      email: "ইমেইল",
      password: "পাসওয়ার্ড",
      loginButton: "লগইন",
      loggingIn: "লগইন হচ্ছে...",
      invalidCredentials: "ইমেইল বা পাসওয়ার্ড ভুল",
    },

    // Forms
    forms: {
      // Common form fields
      name: "নাম",
      fullName: "পূর্ণ নাম",
      username: "ইউজারনেম",
      email: "ইমেইল",
      phone: "ফোন",
      address: "ঠিকানা",
      password: "পাসওয়ার্ড",
      role: "রোল",
      notes: "নোট",
      description: "বিবরণ",
      active: "সক্রিয়",
      inactive: "নিষ্ক্রিয়",
      
      // Customer form
      customerName: "গ্রাহকের নাম",
      customerEmail: "গ্রাহকের ইমেইল",
      customerPhone: "গ্রাহকের ফোন",
      customerAddress: "গ্রাহকের ঠিকানা",
      addCustomer: "গ্রাহক যোগ করুন",
      editCustomer: "গ্রাহক সম্পাদনা করুন",
      customerCreated: "গ্রাহক সফলভাবে যোগ করা হয়েছে",
      customerUpdated: "গ্রাহক সফলভাবে আপডেট করা হয়েছে",
      
      // Admin form
      addAdmin: "এডমিন যোগ করুন",
      adminCreated: "এডমিন সফলভাবে তৈরি হয়েছে",
      adminRole: "এডমিন রোল",
      
      // Part form
      partName: "পার্টের নাম",
      partNameBangla: "পার্টের নাম (বাংলা)",
      category: "ক্যাটাগরি",
      brand: "ব্র্যান্ড",
      sku: "SKU",
      partNumber: "পার্ট নম্বর",
      quantity: "পরিমাণ",
      costPrice: "ক্রয় মূল্য",
      sellingPrice: "বিক্রয় মূল্য",
      minStockLevel: "ন্যূনতম স্টক লেভেল",
      addPart: "পার্ট যোগ করুন",
      editPart: "পার্ট সম্পাদনা করুন",
      partCreated: "পার্ট সফলভাবে যোগ করা হয়েছে",
      partUpdated: "পার্ট সফলভাবে আপডেট করা হয়েছে",
      selectCategory: "ক্যাটাগরি নির্বাচন করুন",
      selectBrand: "ব্র্যান্ড নির্বাচন করুন",
      
      // Service form
      serviceName: "সার্ভিসের নাম",
      serviceNameBangla: "সার্ভিসের নাম (বাংলা)",
      price: "মূল্য",
      duration: "সময়কাল",
      durationMinutes: "সময়কাল (মিনিট)",
      addService: "সার্ভিস যোগ করুন",
      editService: "সার্ভিস সম্পাদনা করুন",
      serviceCreated: "সার্ভিস সফলভাবে যোগ করা হয়েছে",
      serviceUpdated: "সার্ভিস সফলভাবে আপডেট করা হয়েছে",
      
      // Category forms
      categoryName: "ক্যাটাগরির নাম",
      categoryNameBangla: "ক্যাটাগরির নাম (বাংলা)",
      brandName: "ব্র্যান্ডের নাম",
      addCategory: "ক্যাটাগরি যোগ করুন",
      editCategory: "ক্যাটাগরি সম্পাদনা করুন",
      categoryCreated: "ক্যাটাগরি সফলভাবে তৈরি হয়েছে",
      categoryUpdated: "ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে",
      addPartCategory: "পার্ট ক্যাটাগরি যোগ করুন",
      editPartCategory: "পার্ট ক্যাটাগরি সম্পাদনা করুন",
      partCategoryCreated: "পার্ট ক্যাটাগরি সফলভাবে তৈরি হয়েছে",
      partCategoryUpdated: "পার্ট ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে",
      addServiceCategory: "সার্ভিস ক্যাটাগরি যোগ করুন",
      editServiceCategory: "সার্ভিস ক্যাটাগরি সম্পাদনা করুন",
      serviceCategoryCreated: "সার্ভিস ক্যাটাগরি সফলভাবে তৈরি হয়েছে",
      serviceCategoryUpdated: "সার্ভিস ক্যাটাগরি সফলভাবে আপডেট করা হয়েছে",
      addBrand: "ব্র্যান্ড যোগ করুন",
      editBrand: "ব্র্যান্ড সম্পাদনা করুন",
      brandCreated: "ব্র্যান্ড সফলভাবে তৈরি হয়েছে",
      brandUpdated: "ব্র্যান্ড সফলভাবে আপডেট করা হয়েছে",
      updateCategoryDetails: "ক্যাটাগরির বিবরণ আপডেট করুন",
      addNewPartCategory: "নতুন পার্ট ক্যাটাগরি যোগ করুন",
      addNewServiceCategory: "নতুন সার্ভিস ক্যাটাগরি যোগ করুন",
      updateBrandDetails: "ব্র্যান্ডের বিবরণ আপডেট করুন",
      addNewBrand: "নতুন ব্র্যান্ড যোগ করুন",
      countryOfOrigin: "উৎপত্তিস্থল দেশ",
      updateServiceDetails: "সার্ভিসের বিবরণ আপডেট করুন",
      addNewService: "নতুন সার্ভিস যোগ করুন",
      servicePrice: "সার্ভিসের মূল্য",
      create: "তৈরি করুন",
      update: "আপডেট করুন",
      
      // Validation messages
      required: "এটি আবশ্যক",
      invalidEmail: "সঠিক ইমেইল দিন",
      minLength: "ন্যূনতম দৈর্ঘ্য",
      maxLength: "সর্বোচ্চ দৈর্ঘ্য",
      
      // Buttons
      submit: "জমা দিন",
      saving: "সংরক্ষণ হচ্ছে...",
      success: "সফল",
      error: "ত্রুটি",
      
      // Placeholders
      enterName: "নাম লিখুন",
      enterEmail: "ইমেইল লিখুন",
      enterPhone: "ফোন নম্বর লিখুন",
      enterAddress: "ঠিকানা লিখুন",
      enterUsername: "ইউজারনেম লিখুন",
      enterPassword: "পাসওয়ার্ড লিখুন",
      optional: "ঐচ্ছিক",
    },
    settings: {
      customizeSubtitle: "ইনভয়েসের চেহারা এবং সেটিংস কাস্টমাইজ করুন",
      branding: "ব্র্যান্ডিং",
      customizeAppearance: "আপনার ইনভয়েসের উপস্থিতি কাস্টমাইজ করুন",
      logo: "লোগো",
      noLogo: "কোনো লোগো নেই",
      upload: "আপলোড করুন",
      primaryColor: "প্রধান রঙ",
      secondaryColor: "মাধ্যমিক রঙ",
      fontSize: "ডকুমেন্ট ফন্টের আকার",
      selectSize: "ফন্টের আকার নির্বাচন করুন",
      sizeXs: "অতিরিক্ত ছোট",
      sizeSm: "ছোট (ডিফল্ট)",
      sizeMd: "মাঝারি",
      sizeLg: "বড়",
      sizeXl: "অতিরিক্ত বড়",
      vatRegNo: "মূসক নিবন্ধন নং (বিন)",
      textContent: "টেক্সট কন্টেন্ট",
      customizeMessages: "হেডার এবং ফুটার মেসেজ কাস্টমাইজ করুন",
      headerText: "হেডার টেক্সট",
      footerText: "ফুটার টেক্সট",
      margins: "পিডিএফ মার্জিন",
      adjustMargins: "ইনভয়েসের প্রিন্ট মার্জিন (মিমি-তে) সামঞ্জস্য করুন",
      marginTop: "উপরের",
      marginRight: "ডানদিকের",
      marginBottom: "নিচের",
      marginLeft: "বামদিকের",
      headerImage: "হেডার ইমেজ",
      uploadHeaderDesc: "ইনভয়েসের জন্য কাস্টম হেডার ইমেজ আপলোড করুন",
      noHeaderImage: "কোনো হেডার ইমেজ নেই",
      showHeaderImage: "হেডার ইমেজ দেখান",
      footerImage: "ফুটার ইমেজ",
      uploadFooterDesc: "ইনভয়েসের জন্য কাস্টম ফুটার ইমেজ আপলোড করুন",
      noFooterImage: "কোনো ফুটার ইমেজ নেই",
      showFooterImage: "ফুটার ইমেজ দেখান",
      fieldVisibility: "ফিল্ড ভিজিবিলিটি (দৃশ্যমানতা)",
      visibilityDesc: "ইনভয়েসে কোন ফিল্ডগুলো প্রদর্শন করা হবে তা নির্বাচন করুন",
      showLogo: "লোগো দেখান",
      showHeader: "হেডার টেক্সট দেখান",
      showFooter: "ফুটার টেক্সট দেখান",
      customerEmail: "গ্রাহকের ইমেইল",
      customerPhone: "গ্রাহকের ফোন",
      customerAddress: "গ্রাহকের ঠিকানা",
      vehicleVin: "গাড়ির ভিআইএন (VIN)",
      licensePlate: "লাইসেন্স প্লেট",
      saveSettings: "সেটিংস সংরক্ষণ করুন",
      saving: "সংরক্ষণ করা হচ্ছে...",
      successLogo: "লোগো সফলভাবে আপলোড করা হয়েছে",
      successHeader: "হেডার ইমেজ সফলভাবে আপলোড করা হয়েছে",
      successFooter: "ফুটার ইমেজ সফলভাবে আপলোড করা হয়েছে",
      successSave: "সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে",
    },
  },
  
  en: {
    // Common
    common: {
      search: "Search",
      clear: "Clear",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      create: "Create",
      update: "Update",
      actions: "Actions",
      status: "Status",
      total: "Total",
      paid: "Paid",
      due: "Due",
      yes: "Yes",
      no: "No",
      logout: "Logout",
    },
    
    // Dashboard
    dashboard: {
      title: "Dashboard",
      monthlyRevenue: "Monthly Revenue",
      weeklyRevenue: "Weekly Revenue",
      totalRevenue: "Total Revenue",
      outstandingBalance: "Outstanding Balance",
      invoices: "Invoices",
      quotations: "Quotations",
      customers: "Customers",
      parts: "Parts",
      services: "Services",
      sales: "Sales",
      admins: "Admins",
      categories: "Categories",
      settings: "Settings",
      welcome: "Welcome to Benz Automobile management system",
      lowStockAlert: "Low Stock Alert",
      allTime: "All time",
      revenueLast7Days: "Revenue (Last 7 Days)",
      recentInvoices: "Recent Invoices",
      noInvoices: "No invoices yet",
      vsLastMonth: "vs last month",
      paidInvoicesLast7Days: "Paid invoices, last 7 days",
      allPaidInvoices: "All paid invoices",
      dueInvoices: "Due invoices",
      inventoryValueCost: "Inventory Value (Cost)",
      sumPartsCostPrice: "Sum of parts cost price",
    },
    
    // Invoices
    invoices: {
      title: "Invoices",
      createNew: "Create New Invoice",
      searchPlaceholder: "Search by invoice #, customer, or vehicle...",
      invoiceNumber: "Invoice #",
      customer: "Customer",
      vehicle: "Vehicle",
      date: "Date",
      amount: "Amount",
      markAsPaid: "Mark as Paid",
      viewInvoice: "View Invoice",
      printInvoice: "Print",
      noInvoices: "No invoices yet",
      noInvoicesDesc: "Create your first invoice to get started",
      noResults: "No invoices found",
      noResultsDesc: "Try a different search term",
      confirmMarkPaid: "Mark as paid?",
      confirmMarkPaidDesc: "This action cannot be undone",
      alreadyPaid: "Already marked as paid",
      statusUpdated: "Status updated successfully",
    },
    
    // Quotations
    quotations: {
      title: "Quotations",
      createNew: "Create New Quotation",
      searchPlaceholder: "Search by quotation #, customer, or vehicle...",
      quotationNumber: "Quotation #",
      customer: "Customer",
      vehicle: "Vehicle",
      date: "Date",
      amount: "Amount",
      viewQuotation: "View Quotation",
      editQuotation: "Edit Quotation",
      printQuotation: "Print",
      noQuotations: "No quotations yet",
      noQuotationsDesc: "Create your first quotation to get started",
      noResults: "No quotations found",
      noResultsDesc: "Try a different search term",
      deleteConfirm: "Delete quotation?",
      deleteConfirmDesc: "This action cannot be undone",
    },
    
    // Customers
    customers: {
      title: "Customers",
      createNew: "Add New Customer",
      searchPlaceholder: "Search by name, phone, or email...",
      name: "Name",
      phone: "Phone",
      email: "Email",
      address: "Address",
      totalDue: "Total Due",
      totalPaid: "Total Paid",
      hasOutstanding: "Has outstanding balance",
      noCustomers: "No customers yet",
      noCustomersDesc: "Add your first customer to get started",
      noResults: "No customers found",
      noResultsDesc: "Try a different search term",
    },
    
    // Sales
    sales: {
      title: "Sales",
      totalRevenue: "Total Revenue",
      totalSales: "Total Sales",
      averageInvoice: "Average Invoice Value",
      salesListing: "Sales Listing",
      filterToday: "Today",
      filterWeek: "This Week",
      filterMonth: "This Month",
      filterCustom: "Custom Range",
      forPeriod: "For selected period",
      invoicesGenerated: "Invoices generated",
      perInvoice: "Per invoice",
      loadingSales: "Loading sales data...",
      searchPlaceholder: "Search by invoice # or customer name...",
    },
    
    // Parts
    parts: {
      title: "Parts",
      createNew: "Add New Part",
      partName: "Part Name",
      category: "Category",
      brand: "Brand",
      price: "Price",
      stock: "Stock",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      noParts: "No parts yet",
      noPartsDesc: "Add your first part to get started",
      searchPlaceholder: "Search by name, SKU, or part number...",
    },
    
    // Services
    services: {
      title: "Services",
      createNew: "Add New Service",
      serviceName: "Service Name",
      category: "Category",
      price: "Price",
      duration: "Duration",
      noServices: "No services yet",
      noServicesDesc: "Add your first service to get started",
    },
    
    // Categories
    categories: {
      title: "Categories",
      partCategories: "Part Categories",
      partBrands: "Part Brands",
      serviceCategories: "Service Categories",
      createPartCategory: "Create Part Category",
      createPartBrand: "Create Part Brand",
      createServiceCategory: "Create Service Category",
      categoryName: "Category Name",
      brandName: "Brand Name",
      noCategories: "No categories yet",
      noCategoriesDesc: "Create your first category",
    },
    
    // Admins
    admins: {
      title: "Admins",
      createNew: "Add New Admin",
      email: "Email",
      role: "Role",
      superAdmin: "Super Admin",
      admin: "Admin",
      noAdmins: "No admins yet",
      noAdminsDesc: "Add your first admin",
    },
    
    // Auth
    auth: {
      login: "Login",
      email: "Email",
      password: "Password",
      loginButton: "Login",
      loggingIn: "Logging in...",
      invalidCredentials: "Invalid email or password",
    },

    // Forms
    forms: {
      // Common form fields
      name: "Name",
      fullName: "Full Name",
      username: "Username",
      email: "Email",
      phone: "Phone",
      address: "Address",
      password: "Password",
      role: "Role",
      notes: "Notes",
      description: "Description",
      active: "Active",
      inactive: "Inactive",
      
      // Customer form
      customerName: "Customer Name",
      customerEmail: "Customer Email",
      customerPhone: "Customer Phone",
      customerAddress: "Customer Address",
      addCustomer: "Add Customer",
      editCustomer: "Edit Customer",
      customerCreated: "Customer created successfully",
      customerUpdated: "Customer updated successfully",
      
      // Admin form
      addAdmin: "Add Admin",
      adminCreated: "Admin created successfully",
      adminRole: "Admin Role",
      
      // Part form
      partName: "Part Name",
      partNameBangla: "Part Name (Bangla)",
      category: "Category",
      brand: "Brand",
      sku: "SKU",
      partNumber: "Part Number",
      quantity: "Quantity",
      costPrice: "Cost Price",
      sellingPrice: "Selling Price",
      minStockLevel: "Minimum Stock Level",
      addPart: "Add Part",
      editPart: "Edit Part",
      partCreated: "Part created successfully",
      partUpdated: "Part updated successfully",
      selectCategory: "Select Category",
      selectBrand: "Select Brand",
      
      // Service form
      serviceName: "Service Name",
      serviceNameBangla: "Service Name (Bangla)",
      price: "Price",
      duration: "Duration",
      durationMinutes: "Duration (minutes)",
      addService: "Add Service",
      editService: "Edit Service",
      serviceCreated: "Service created successfully",
      serviceUpdated: "Service updated successfully",
      
      // Category forms
      categoryName: "Category Name",
      categoryNameBangla: "Category Name (Bangla)",
      brandName: "Brand Name",
      addCategory: "Add Category",
      editCategory: "Edit Category",
      categoryCreated: "Category created successfully",
      categoryUpdated: "Category updated successfully",
      addPartCategory: "Add Part Category",
      editPartCategory: "Edit Part Category",
      partCategoryCreated: "Part category created successfully",
      partCategoryUpdated: "Part category updated successfully",
      addServiceCategory: "Add Service Category",
      editServiceCategory: "Edit Service Category",
      serviceCategoryCreated: "Service category created successfully",
      serviceCategoryUpdated: "Service category updated successfully",
      addBrand: "Add Brand",
      editBrand: "Edit Brand",
      brandCreated: "Brand created successfully",
      brandUpdated: "Brand updated successfully",
      updateCategoryDetails: "Update category details",
      addNewPartCategory: "Add a new part category",
      addNewServiceCategory: "Add a new service category",
      updateBrandDetails: "Update brand details",
      addNewBrand: "Add a new part brand",
      countryOfOrigin: "Country of Origin",
      updateServiceDetails: "Update service details",
      addNewService: "Add a new automotive service",
      servicePrice: "Service Price",
      create: "Create",
      update: "Update",
      
      // Validation messages
      required: "This field is required",
      invalidEmail: "Please enter a valid email",
      minLength: "Minimum length",
      maxLength: "Maximum length",
      
      // Buttons
      submit: "Submit",
      saving: "Saving...",
      success: "Success",
      error: "Error",
      
      // Placeholders
      enterName: "Enter name",
      enterEmail: "Enter email",
      enterPhone: "Enter phone number",
      enterAddress: "Enter address",
      enterUsername: "Enter username",
      enterPassword: "Enter password",
      optional: "Optional",
    },
    settings: {
      customizeSubtitle: "Customize invoice appearance and settings",
      branding: "Branding",
      customizeAppearance: "Customize your invoice appearance",
      logo: "Logo",
      noLogo: "No logo",
      upload: "Upload",
      primaryColor: "Primary Color",
      secondaryColor: "Secondary Color",
      fontSize: "Document Font Size",
      selectSize: "Select text size",
      sizeXs: "Extra Small",
      sizeSm: "Small (Default)",
      sizeMd: "Medium",
      sizeLg: "Large",
      sizeXl: "Extra Large",
      vatRegNo: "VAT REG NO.(BIN)",
      textContent: "Text Content",
      customizeMessages: "Customize header and footer messages",
      headerText: "Header Text",
      footerText: "Footer Text",
      margins: "PDF Margins",
      adjustMargins: "Adjust print margins (in mm) for invoices",
      marginTop: "Top",
      marginRight: "Right",
      marginBottom: "Bottom",
      marginLeft: "Left",
      headerImage: "Header Image",
      uploadHeaderDesc: "Upload a custom header image for invoices",
      noHeaderImage: "No header image",
      showHeaderImage: "Show Header Image",
      footerImage: "Footer Image",
      uploadFooterDesc: "Upload a custom footer image for invoices",
      noFooterImage: "No footer image",
      showFooterImage: "Show Footer Image",
      fieldVisibility: "Field Visibility",
      visibilityDesc: "Choose which fields to display on invoices",
      showLogo: "Show Logo",
      showHeader: "Show Header Text",
      showFooter: "Show Footer Text",
      customerEmail: "Customer Email",
      customerPhone: "Customer Phone",
      customerAddress: "Customer Address",
      vehicleVin: "Vehicle VIN",
      licensePlate: "License Plate",
      saveSettings: "Save Settings",
      saving: "Saving...",
      successLogo: "Logo uploaded successfully",
      successHeader: "Header image uploaded successfully",
      successFooter: "Footer image uploaded successfully",
      successSave: "Settings saved successfully",
    },
  },
};
