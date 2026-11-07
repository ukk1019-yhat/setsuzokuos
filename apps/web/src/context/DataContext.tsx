import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '../api/client';
import {
  ClientDto,
  QuotationDto,
  QuotationStatus,
  ProjectDto,
  ProjectStatus,
  Priority,
  TaskDto,
  TaskStatus,
  InvoiceDto,
  InvoiceStatus,
  LeadDto,
  LeadStatus,
  PaymentMethod,
} from '@setsuzoku/shared';

// Initial production-realistic seed data for an Indian media production agency
export const INITIAL_CLIENTS: ClientDto[] = [
  {
    id: 'client_demo_001',
    organizationId: 'org_demo_001',
    name: 'Aditya Sen',
    company: 'Swiggy Brand Studio',
    email: 'aditya.sen@swiggy.in',
    phone: '+91 98450 12890',
    billingAddress: 'Tower D, IBC Knowledge Park, Bannerghatta Road, Bengaluru',
    taxId: '29AABCS1429B1Z',
    category: 'Enterprise Fixed-Scope',
    notes: 'Quarterly brand commercial video production retainer',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    stats: {
      totalQuotations: 3,
      totalProjects: 2,
      totalInvoiced: 485000,
    },
  },
  {
    id: 'client_demo_002',
    organizationId: 'org_demo_001',
    name: 'Priya Varma',
    company: 'Zepto Media Lab',
    email: 'priya.varma@zepto.co.in',
    phone: '+91 91234 56789',
    billingAddress: '100 Feet Road, Indiranagar, Bengaluru',
    taxId: '29AABCZ9911C1Z',
    category: 'Retainer',
    notes: 'Packaging 3D CGI and digital campaign assets',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    stats: {
      totalQuotations: 2,
      totalProjects: 1,
      totalInvoiced: 240000,
    },
  },
  {
    id: 'client_demo_003',
    organizationId: 'org_demo_001',
    name: 'Rahul Sharma',
    company: 'Ather Energy Creative',
    email: 'rahul.sharma@atherenergy.com',
    phone: '+91 99800 22331',
    billingAddress: 'IBC Knowledge Park, Bannerghatta Road, Bengaluru',
    taxId: '29AAACA7722M1Z',
    category: 'Enterprise Fixed-Scope',
    notes: 'Electric scooter launch campaign & 3D key visual renders',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    stats: {
      totalQuotations: 4,
      totalProjects: 3,
      totalInvoiced: 720000,
    },
  },
  {
    id: 'client_demo_004',
    organizationId: 'org_demo_001',
    name: 'Chokkapu Uma Krishna Kanth',
    company: 'Willcom',
    email: 'umakrishnakanthchokkapu15@gmail.com',
    phone: '+91 91215 05879',
    billingAddress: '5-3-96/a, Kondappa Veedhi, Pithapuram',
    taxId: '27AAAAAERT34568',
    category: 'Enterprise Fixed-Scope',
    notes: 'Media operations and creative technical consulting',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    stats: {
      totalQuotations: 1,
      totalProjects: 1,
      totalInvoiced: 185000,
    },
  },
];

export const INITIAL_QUOTATIONS: QuotationDto[] = [
  {
    id: 'quote_demo_001',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_001',
    createdById: 'user_admin_001',
    quoteNumber: 'QT-2026-0101',
    status: QuotationStatus.ACCEPTED,
    subtotal: 245000,
    discountAmount: 10000,
    taxAmount: 42300,
    totalAmount: 277300,
    currency: 'INR',
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString(),
    paymentTerms: '50% Advance, 50% on Final Master Delivery',
    notes: 'Includes color grading and 5.1 surround sound mastering',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    items: [
      {
        id: 'item_001',
        quotationId: 'quote_demo_001',
        serviceName: 'Commercial Video Post-Production Master',
        description: 'Offline/Online edit, DaVinci Resolve color grade, VFX cleanup',
        quantity: 1,
        unitPrice: 200000,
        totalPrice: 200000,
      },
      {
        id: 'item_002',
        quotationId: 'quote_demo_001',
        serviceName: 'Audio Post & Surround Mix',
        description: 'Sound design, Foley, dialogue cleanup, 5.1 mastering',
        quantity: 1,
        unitPrice: 45000,
        totalPrice: 45000,
      },
    ],
  },
  {
    id: 'quote_demo_002',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_002',
    createdById: 'user_admin_001',
    quoteNumber: 'QT-2026-0102',
    status: QuotationStatus.SENT,
    subtotal: 180000,
    discountAmount: 5000,
    taxAmount: 31500,
    totalAmount: 206500,
    currency: 'INR',
    validUntil: new Date(Date.now() + 10 * 86400000).toISOString(),
    paymentTerms: '100% on delivery within 14 days',
    notes: 'High-res photorealistic 3D renders for fast-delivery campaign',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    items: [
      {
        id: 'item_003',
        quotationId: 'quote_demo_002',
        serviceName: '3D Product CGI & Packaging Renders',
        description: 'Blender 4.0 photorealistic key visual renderings',
        quantity: 3,
        unitPrice: 60000,
        totalPrice: 180000,
      },
    ],
  },
  {
    id: 'quote_demo_003',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_003',
    createdById: 'user_admin_001',
    quoteNumber: 'QT-2026-0103',
    status: QuotationStatus.ACCEPTED,
    subtotal: 420000,
    discountAmount: 20000,
    taxAmount: 72000,
    totalAmount: 472000,
    currency: 'INR',
    validUntil: new Date(Date.now() + 20 * 86400000).toISOString(),
    paymentTerms: '40% Advance, 40% Mid-point, 20% on Handover',
    notes: 'National campaign launch visuals and animated 3D breakdowns',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    items: [
      {
        id: 'item_004',
        quotationId: 'quote_demo_003',
        serviceName: 'Electric Scooter Launch Visual Campaign',
        description: 'Complete 3D cinematic teaser, cutdowns, and social stills',
        quantity: 1,
        unitPrice: 420000,
        totalPrice: 420000,
      },
    ],
  },
  {
    id: 'quote_demo_004',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_004',
    createdById: 'user_admin_001',
    quoteNumber: 'QT-2026-0104',
    status: QuotationStatus.ACCEPTED,
    subtotal: 185000,
    discountAmount: 0,
    taxAmount: 33300,
    totalAmount: 218300,
    currency: 'INR',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
    paymentTerms: '50% Milestone 1, 50% on Final Delivery',
    notes: 'Media workflow pipeline setup and client engagement portal',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    items: [
      {
        id: 'item_005',
        quotationId: 'quote_demo_004',
        serviceName: 'Media Production & Infrastructure Rollout',
        description: 'Complete delivery pipeline and technical consulting',
        quantity: 1,
        unitPrice: 185000,
        totalPrice: 185000,
      },
    ],
  },
];

export const INITIAL_PROJECTS: ProjectDto[] = [
  {
    id: 'proj_demo_001',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_001',
    name: 'Commercial Video Post-Production Master',
    code: 'PRJ-2026-01',
    description: 'Hero television and digital campaign post-production',
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    budget: 245000,
    deadline: new Date(Date.now() + 12 * 86400000).toISOString(),
    progressPercentage: 65,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj_demo_002',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_002',
    name: 'Packaging 3D CGI Campaign Assets',
    code: 'PRJ-2026-02',
    description: '3D packaging and product visualizer renders',
    status: ProjectStatus.ACTIVE,
    priority: Priority.MEDIUM,
    budget: 180000,
    deadline: new Date(Date.now() + 8 * 86400000).toISOString(),
    progressPercentage: 40,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'proj_demo_003',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_003',
    name: 'Ather Electric Scooter Key Visual Renders',
    code: 'PRJ-2026-03',
    description: 'High-polygon CAD import and cinema-quality renders',
    status: ProjectStatus.ACTIVE,
    priority: Priority.URGENT,
    budget: 420000,
    deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    progressPercentage: 80,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'proj_demo_004',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_004',
    name: 'Willcom Enterprise Media Production',
    code: 'PRJ-2026-04',
    description: 'End-to-end media operations & production deliverables',
    status: ProjectStatus.ACTIVE,
    priority: Priority.HIGH,
    budget: 185000,
    deadline: new Date(Date.now() + 25 * 86400000).toISOString(),
    progressPercentage: 25,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_LEADS: LeadDto[] = [
  {
    id: 'lead_demo_001',
    organizationId: 'org_demo_001',
    title: 'Brand Anthem Video Shoot & Editing',
    contactName: 'Ananya Roy',
    email: 'ananya.roy@boat-lifestyle.com',
    phone: '+91 98111 22334',
    companyName: 'boAt Lifestyle Creative',
    status: LeadStatus.CONTACTED,
    priority: Priority.HIGH,
    estimatedBudget: 350000,
    serviceRequired: 'Video Production & Color Grade',
    notes: 'Wants full 60s brand film ready for Diwali launch',
    tags: ['Brand Film', 'High Value'],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    activities: [],
  },
  {
    id: 'lead_demo_002',
    organizationId: 'org_demo_001',
    title: 'OTT Series Title Sequence & VFX',
    contactName: 'Vikram Joshi',
    email: 'vikram.j@netflix-india.com',
    phone: '+91 99200 88776',
    companyName: 'Netflix India Originals',
    status: LeadStatus.QUALIFIED,
    priority: Priority.URGENT,
    estimatedBudget: 580000,
    serviceRequired: 'CGI & Title Animation',
    notes: 'Pitching motion design concepts on Monday',
    tags: ['OTT', 'VFX', 'Urgent'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    activities: [],
  },
];

export const INITIAL_INVOICES: InvoiceDto[] = [
  {
    id: 'inv_demo_001',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_001',
    projectId: 'proj_demo_001',
    invoiceNumber: 'INV-2026-0142',
    status: InvoiceStatus.OVERDUE,
    subtotal: 160000,
    discountAmount: 0,
    taxAmount: 26400,
    totalAmount: 186400,
    amountPaid: 0,
    balanceDue: 186400,
    currency: 'INR',
    issuedDate: new Date(Date.now() - 20 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    notes: 'Advance milestone billing for video post-production',
    paymentTerms: 'Payment due within 14 days of invoice date.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    items: [
      {
        id: 'inv_item_001',
        invoiceId: 'inv_demo_001',
        serviceName: 'Post-Production Master Milestone 1',
        description: 'Offline edit and sound sync lock',
        quantity: 1,
        unitPrice: 160000,
        totalPrice: 160000,
      },
    ],
  },
  {
    id: 'inv_demo_002',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_002',
    projectId: 'proj_demo_002',
    invoiceNumber: 'INV-2026-0143',
    status: InvoiceStatus.ISSUED,
    subtotal: 210000,
    discountAmount: 10000,
    taxAmount: 36000,
    totalAmount: 236000,
    amountPaid: 0,
    balanceDue: 236000,
    currency: 'INR',
    issuedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    dueDate: new Date(Date.now() + 9 * 86400000).toISOString(),
    notes: 'Packaging 3D renders batch 1',
    paymentTerms: 'Payment due within 14 days of invoice date.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    items: [
      {
        id: 'inv_item_002',
        invoiceId: 'inv_demo_002',
        serviceName: '3D CGI Packaging Asset Generation',
        description: 'Render outputs in 4K resolution',
        quantity: 1,
        unitPrice: 210000,
        totalPrice: 210000,
      },
    ],
  },
  {
    id: 'inv_demo_003',
    organizationId: 'org_demo_001',
    clientId: 'client_demo_003',
    projectId: 'proj_demo_003',
    invoiceNumber: 'INV-2026-0144',
    status: InvoiceStatus.PAID,
    subtotal: 380000,
    discountAmount: 10000,
    taxAmount: 66600,
    totalAmount: 436600,
    amountPaid: 436600,
    balanceDue: 0,
    currency: 'INR',
    issuedDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    notes: 'Initial deposit for 3D launch renders',
    paymentTerms: 'Settled via RTGS on Oct 28',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    items: [
      {
        id: 'inv_item_003',
        invoiceId: 'inv_demo_003',
        serviceName: 'Electric Scooter Teaser Retainer',
        description: 'Advance commitment fee',
        quantity: 1,
        unitPrice: 380000,
        totalPrice: 380000,
      },
    ],
  },
];

export const INITIAL_TASKS: TaskDto[] = [
  {
    id: 'task_demo_001',
    projectId: 'proj_demo_001',
    title: 'DaVinci Resolve Final Color Pass',
    description: 'Match skin tones across outdoor natural light scenes and indoor studio scenes',
    status: TaskStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [
      { id: 'sub_001', taskId: 'task_demo_001', title: 'Export XML from Premiere', isCompleted: true },
      { id: 'sub_002', taskId: 'task_demo_001', title: 'Apply show LUT and shot matching', isCompleted: true },
      { id: 'sub_003', taskId: 'task_demo_001', title: 'Director review session', isCompleted: false },
    ],
    comments: [],
  },
  {
    id: 'task_demo_002',
    projectId: 'proj_demo_002',
    title: 'CGI Lighting & Shadow Refinement',
    description: 'Subtle reflections on metallic package foil shaders',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    comments: [],
  },
];

interface DataContextType {
  clients: ClientDto[];
  quotations: QuotationDto[];
  projects: ProjectDto[];
  leads: LeadDto[];
  invoices: InvoiceDto[];
  tasks: TaskDto[];
  isLoading: boolean;
  createClient: (clientData: Partial<ClientDto>) => Promise<ClientDto>;
  updateClient: (id: string, updates: Partial<ClientDto>) => Promise<ClientDto>;
  createQuotation: (quoteData: any) => Promise<QuotationDto>;
  updateQuotationStatus: (id: string, status: QuotationStatus) => Promise<void>;
  createProject: (projectData: any) => Promise<ProjectDto>;
  spawnProjectFromQuotation: (quotationId: string, customName?: string) => Promise<ProjectDto>;
  createTask: (taskData: any) => Promise<TaskDto>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  createInvoice: (invoiceData: any) => Promise<InvoiceDto>;
  recordPayment: (invoiceId: string, paymentData: any) => Promise<void>;
  createLead: (leadData: any) => Promise<LeadDto>;
  convertLeadToClient: (leadId: string, clientDetails: any) => Promise<ClientDto>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage for key ${key}:`, e);
  }
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientDto[]>(() =>
    loadFromStorage('setsuzoku_synced_clients', INITIAL_CLIENTS)
  );
  const [quotations, setQuotations] = useState<QuotationDto[]>(() =>
    loadFromStorage('setsuzoku_synced_quotations', INITIAL_QUOTATIONS)
  );
  const [projects, setProjects] = useState<ProjectDto[]>(() =>
    loadFromStorage('setsuzoku_synced_projects', INITIAL_PROJECTS)
  );
  const [leads, setLeads] = useState<LeadDto[]>(() =>
    loadFromStorage('setsuzoku_synced_leads', INITIAL_LEADS)
  );
  const [invoices, setInvoices] = useState<InvoiceDto[]>(() =>
    loadFromStorage('setsuzoku_synced_invoices', INITIAL_INVOICES)
  );
  const [tasks, setTasks] = useState<TaskDto[]>(() =>
    loadFromStorage('setsuzoku_synced_tasks', INITIAL_TASKS)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sync to localStorage whenever state updates
  useEffect(() => {
    saveToStorage('setsuzoku_synced_clients', clients);
  }, [clients]);

  useEffect(() => {
    saveToStorage('setsuzoku_synced_quotations', quotations);
  }, [quotations]);

  useEffect(() => {
    saveToStorage('setsuzoku_synced_projects', projects);
  }, [projects]);

  useEffect(() => {
    saveToStorage('setsuzoku_synced_leads', leads);
  }, [leads]);

  useEffect(() => {
    saveToStorage('setsuzoku_synced_invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    saveToStorage('setsuzoku_synced_tasks', tasks);
  }, [tasks]);

  // Background fetch to sync with API if available
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [apiClients, apiQuotes, apiProjects, apiLeads, apiInvoices, apiTasks] = await Promise.allSettled([
        apiRequest<ClientDto[]>('/clients'),
        apiRequest<QuotationDto[]>('/quotations'),
        apiRequest<ProjectDto[]>('/projects'),
        apiRequest<LeadDto[]>('/leads'),
        apiRequest<InvoiceDto[]>('/invoices'),
        apiRequest<TaskDto[]>('/tasks'),
      ]);

      if (apiClients.status === 'fulfilled' && Array.isArray(apiClients.value) && apiClients.value.length > 0) {
        setClients((prev) => {
          const apiMap = new Map(apiClients.value.map((c) => [c.id, c]));
          // Preserve local additions that might not yet be in remote API
          const combined = [...apiClients.value];
          for (const local of prev) {
            if (!apiMap.has(local.id)) combined.push(local);
          }
          return combined;
        });
      }

      if (apiQuotes.status === 'fulfilled' && Array.isArray(apiQuotes.value) && apiQuotes.value.length > 0) {
        setQuotations((prev) => {
          const apiMap = new Map(apiQuotes.value.map((q) => [q.id, q]));
          const combined = [...apiQuotes.value];
          for (const local of prev) {
            if (!apiMap.has(local.id)) combined.push(local);
          }
          return combined;
        });
      }

      if (apiProjects.status === 'fulfilled' && Array.isArray(apiProjects.value) && apiProjects.value.length > 0) {
        setProjects((prev) => {
          const apiMap = new Map(apiProjects.value.map((p) => [p.id, p]));
          const combined = [...apiProjects.value];
          for (const local of prev) {
            if (!apiMap.has(local.id)) combined.push(local);
          }
          return combined;
        });
      }

      if (apiLeads.status === 'fulfilled' && Array.isArray(apiLeads.value) && apiLeads.value.length > 0) {
        setLeads((prev) => {
          const apiMap = new Map(apiLeads.value.map((l) => [l.id, l]));
          const combined = [...apiLeads.value];
          for (const local of prev) {
            if (!apiMap.has(local.id)) combined.push(local);
          }
          return combined;
        });
      }

      if (apiInvoices.status === 'fulfilled' && Array.isArray(apiInvoices.value) && apiInvoices.value.length > 0) {
        setInvoices((prev) => {
          const apiMap = new Map(apiInvoices.value.map((i) => [i.id, i]));
          const combined = [...apiInvoices.value];
          for (const local of prev) {
            if (!apiMap.has(local.id)) combined.push(local);
          }
          return combined;
        });
      }

      if (apiTasks.status === 'fulfilled' && Array.isArray(apiTasks.value) && apiTasks.value.length > 0) {
        setTasks((prev) => {
          const apiMap = new Map(apiTasks.value.map((t) => [t.id, t]));
          const combined = [...apiTasks.value];
          for (const local of prev) {
            if (!apiMap.has(local.id)) combined.push(local);
          }
          return combined;
        });
      }
    } catch (err) {
      console.warn('API sync completed with local cached state active:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // --- Reactive Action Handlers ---

  const createClient = async (clientData: Partial<ClientDto>): Promise<ClientDto> => {
    const newClient: ClientDto = {
      id: `client_${Date.now()}`,
      organizationId: 'org_demo_001',
      name: clientData.name || 'New Client',
      company: clientData.company || null,
      email: clientData.email || 'client@setsuzoku.in',
      phone: clientData.phone || null,
      billingAddress: clientData.billingAddress || null,
      taxId: clientData.taxId || null,
      category: clientData.category || 'Enterprise Fixed-Scope',
      notes: clientData.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalQuotations: 0,
        totalProjects: 0,
        totalInvoiced: 0,
      },
    };

    // Update state immediately across all pages
    setClients((prev) => [newClient, ...prev]);

    // Attempt remote save in background
    try {
      const saved = await apiRequest<ClientDto>('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      });
      if (saved && saved.id) {
        setClients((prev) => prev.map((c) => (c.id === newClient.id ? saved : c)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend client create saved to local state:', err);
    }
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<ClientDto>): Promise<ClientDto> => {
    let updatedObj: ClientDto | undefined;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedObj = { ...c, ...updates, updatedAt: new Date().toISOString() };
          return updatedObj;
        }
        return c;
      })
    );

    try {
      await apiRequest(`/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Client update synced locally:', err);
    }
    return updatedObj!;
  };

  const createQuotation = async (quoteData: any): Promise<QuotationDto> => {
    const client = clients.find((c) => c.id === quoteData.clientId);
    const subtotal = quoteData.items.reduce(
      (sum: number, it: any) => sum + Number(it.quantity) * Number(it.unitPrice),
      0
    );
    const discount = Number(quoteData.discountAmount || 0);
    const tax = Number(quoteData.taxAmount || 0);
    const total = subtotal - discount + tax;

    const newQuote: QuotationDto = {
      id: `quote_${Date.now()}`,
      organizationId: 'org_demo_001',
      clientId: quoteData.clientId,
      client: client,
      createdById: 'user_admin_001',
      quoteNumber: `QT-2026-0${Math.floor(100 + Math.random() * 900)}`,
      status: QuotationStatus.DRAFT,
      subtotal,
      discountAmount: discount,
      taxAmount: tax,
      totalAmount: total,
      currency: 'INR',
      validUntil: quoteData.validUntil || new Date(Date.now() + 15 * 86400000).toISOString(),
      paymentTerms: quoteData.paymentTerms || '50% Advance, 50% on Final Delivery',
      notes: quoteData.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: quoteData.items.map((it: any, idx: number) => ({
        id: `item_${Date.now()}_${idx}`,
        quotationId: `quote_${Date.now()}`,
        serviceName: it.serviceName,
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.quantity) * Number(it.unitPrice),
        createdAt: new Date().toISOString(),
      })),
    };

    setQuotations((prev) => [newQuote, ...prev]);

    try {
      const saved = await apiRequest<QuotationDto>('/quotations', {
        method: 'POST',
        body: JSON.stringify(quoteData),
      });
      if (saved && saved.id) {
        setQuotations((prev) => prev.map((q) => (q.id === newQuote.id ? saved : q)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend quote create saved locally:', err);
    }
    return newQuote;
  };

  const updateQuotationStatus = async (id: string, status: QuotationStatus): Promise<void> => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q))
    );

    try {
      const action = status === QuotationStatus.ACCEPTED ? 'accept' : status === QuotationStatus.SENT ? 'send' : 'status';
      if (action === 'accept' || action === 'send') {
        await apiRequest(`/quotations/${id}/${action}`, { method: 'POST' });
      }
    } catch (err) {
      console.warn('Quote status update saved locally:', err);
    }
  };

  const createProject = async (projectData: any): Promise<ProjectDto> => {
    const client = clients.find((c) => c.id === projectData.clientId);
    const newProj: ProjectDto = {
      id: `proj_${Date.now()}`,
      organizationId: 'org_demo_001',
      clientId: projectData.clientId,
      client,
      name: projectData.name,
      code: `PRJ-2026-0${Math.floor(10 + Math.random() * 90)}`,
      description: projectData.description || null,
      status: ProjectStatus.ACTIVE,
      priority: projectData.priority || Priority.HIGH,
      budget: Number(projectData.budget || 0),
      deadline: projectData.deadline || new Date(Date.now() + 14 * 86400000).toISOString(),
      progressPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);

    try {
      const saved = await apiRequest<ProjectDto>('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      });
      if (saved && saved.id) {
        setProjects((prev) => prev.map((p) => (p.id === newProj.id ? saved : p)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend project create saved locally:', err);
    }
    return newProj;
  };

  const spawnProjectFromQuotation = async (quotationId: string, customName?: string): Promise<ProjectDto> => {
    const quote = quotations.find((q) => q.id === quotationId);
    const client = quote ? clients.find((c) => c.id === quote.clientId) : undefined;

    const newProj: ProjectDto = {
      id: `proj_${Date.now()}`,
      organizationId: 'org_demo_001',
      clientId: quote ? quote.clientId : 'client_demo_001',
      client,
      relatedQuotationId: quotationId,
      name: customName || (quote ? `${quote.items[0]?.serviceName || 'Project'} (${client?.company || 'Delivery'})` : 'New Master Project'),
      code: `PRJ-2026-0${Math.floor(10 + Math.random() * 90)}`,
      status: ProjectStatus.ACTIVE,
      priority: Priority.HIGH,
      budget: quote ? quote.totalAmount : 200000,
      deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
      progressPercentage: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);

    try {
      const saved = await apiRequest<ProjectDto>('/projects/convert-quote', {
        method: 'POST',
        body: JSON.stringify({ quotationId, name: customName }),
      });
      if (saved && saved.id) {
        setProjects((prev) => prev.map((p) => (p.id === newProj.id ? saved : p)));
        return saved;
      }
    } catch (err) {
      console.warn('Spawn project saved locally:', err);
    }
    return newProj;
  };

  const createTask = async (taskData: any): Promise<TaskDto> => {
    const newTask: TaskDto = {
      id: `task_${Date.now()}`,
      projectId: taskData.projectId,
      title: taskData.title,
      description: taskData.description || null,
      assignedToId: taskData.assignedToId || null,
      priority: taskData.priority || Priority.MEDIUM,
      status: TaskStatus.TODO,
      dueDate: taskData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
      comments: [],
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      const saved = await apiRequest<TaskDto>('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData),
      });
      if (saved && saved.id) {
        setTasks((prev) => prev.map((t) => (t.id === newTask.id ? saved : t)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend task create saved locally:', err);
    }
    return newTask;
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );

    try {
      await apiRequest(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      console.warn('Task status update saved locally:', err);
    }
  };

  const createInvoice = async (invoiceData: any): Promise<InvoiceDto> => {
    const client = clients.find((c) => c.id === invoiceData.clientId);
    const subtotal = Number(invoiceData.subtotal || 0);
    const discount = Number(invoiceData.discountAmount || 0);
    const tax = Number(invoiceData.taxAmount || 0);
    const total = subtotal - discount + tax;

    const newInv: InvoiceDto = {
      id: `inv_${Date.now()}`,
      organizationId: 'org_demo_001',
      clientId: invoiceData.clientId,
      client,
      projectId: invoiceData.projectId || null,
      invoiceNumber: `INV-2026-0${Math.floor(100 + Math.random() * 900)}`,
      status: InvoiceStatus.ISSUED,
      subtotal,
      discountAmount: discount,
      taxAmount: tax,
      totalAmount: total,
      amountPaid: 0,
      balanceDue: total,
      currency: 'INR',
      issuedDate: new Date().toISOString(),
      dueDate: invoiceData.dueDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      notes: invoiceData.notes || null,
      paymentTerms: invoiceData.paymentTerms || 'Payment due within 14 days of invoice date.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: invoiceData.items || [],
      payments: [],
    };

    setInvoices((prev) => [newInv, ...prev]);

    try {
      const saved = await apiRequest<InvoiceDto>('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      });
      if (saved && saved.id) {
        setInvoices((prev) => prev.map((i) => (i.id === newInv.id ? saved : i)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend invoice create saved locally:', err);
    }
    return newInv;
  };

  const recordPayment = async (invoiceId: string, paymentData: any): Promise<void> => {
    const amount = Number(paymentData.amount || 0);
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.amountPaid + amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaid);
          const newStatus = newBalance === 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIALLY_PAID;
          return {
            ...inv,
            amountPaid: newPaid,
            balanceDue: newBalance,
            status: newStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return inv;
      })
    );

    try {
      await apiRequest('/payments/record', {
        method: 'POST',
        body: JSON.stringify({
          invoiceId,
          amount,
          method: paymentData.method || PaymentMethod.BANK_TRANSFER,
          transactionRef: paymentData.transactionRef,
          receiptNumber: paymentData.receiptNumber,
          notes: paymentData.notes,
        }),
      });
    } catch (err) {
      console.warn('Payment record saved locally:', err);
    }
  };

  const createLead = async (leadData: any): Promise<LeadDto> => {
    const newLead: LeadDto = {
      id: `lead_${Date.now()}`,
      organizationId: 'org_demo_001',
      title: leadData.title,
      contactName: leadData.contactName,
      email: leadData.email,
      phone: leadData.phone || null,
      companyName: leadData.companyName || null,
      status: LeadStatus.NEW,
      priority: leadData.priority || Priority.MEDIUM,
      estimatedBudget: leadData.estimatedBudget ? Number(leadData.estimatedBudget) : null,
      serviceRequired: leadData.serviceRequired || null,
      notes: leadData.notes || null,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [],
    };

    setLeads((prev) => [newLead, ...prev]);

    try {
      const saved = await apiRequest<LeadDto>('/leads', {
        method: 'POST',
        body: JSON.stringify(leadData),
      });
      if (saved && saved.id) {
        setLeads((prev) => prev.map((l) => (l.id === newLead.id ? saved : l)));
        return saved;
      }
    } catch (err) {
      console.warn('Backend lead create saved locally:', err);
    }
    return newLead;
  };

  const convertLeadToClient = async (leadId: string, clientDetails: any): Promise<ClientDto> => {
    const lead = leads.find((l) => l.id === leadId);
    const newClient: ClientDto = {
      id: `client_${Date.now()}`,
      organizationId: 'org_demo_001',
      name: lead ? lead.contactName : 'New Client',
      company: lead ? lead.companyName : null,
      email: lead ? lead.email : 'client@setsuzoku.in',
      phone: lead ? lead.phone : null,
      billingAddress: clientDetails.billingAddress || null,
      taxId: clientDetails.taxId || null,
      category: clientDetails.category || 'Enterprise Fixed-Scope',
      notes: lead ? `Converted from lead: ${lead.title}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalQuotations: 0,
        totalProjects: 0,
        totalInvoiced: 0,
      },
    };

    setClients((prev) => [newClient, ...prev]);
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, status: LeadStatus.WON, convertedToClientId: newClient.id, updatedAt: new Date().toISOString() }
          : l
      )
    );

    try {
      await apiRequest(`/leads/${leadId}/convert`, {
        method: 'POST',
        body: JSON.stringify(clientDetails),
      });
    } catch (err) {
      console.warn('Lead conversion saved locally:', err);
    }
    return newClient;
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        quotations,
        projects,
        leads,
        invoices,
        tasks,
        isLoading,
        createClient,
        updateClient,
        createQuotation,
        updateQuotationStatus,
        createProject,
        spawnProjectFromQuotation,
        createTask,
        updateTaskStatus,
        createInvoice,
        recordPayment,
        createLead,
        convertLeadToClient,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
