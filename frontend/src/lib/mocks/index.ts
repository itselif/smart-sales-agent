// Lightweight in-memory mock DB and APIs. Toggle via VITE_USE_MOCKS=true

export type Id = string;

export interface MockStore {
	id: Id;
	name: string;
	fullname?: string;
	city?: string;
	avatar?: string;
	active?: boolean;
}

export interface MockInventoryItem {
	id: Id;
	storeId: Id;
	sku: string;
	name: string;
	price: number;
	stock: number;
	reorderLevel?: number | null;
	category?: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface MockStockRequest {
	id: Id;
	itemId: Id;
	sku: string;
	name: string;
	requesterStoreId: Id;
	targetStoreId?: Id | null;
	quantity: number;
	status: "pending" | "approved" | "rejected" | "fulfilled";
	createdAt: string;
	updatedAt: string;
	note?: string;
	decisionNote?: string;
}

export interface MockLowStockAlert {
	itemId: Id;
	sku: string;
	name: string;
	stock: number;
	reorderLevel: number;
	daysToDeplete?: number;
	isAcknowledged: boolean;
}

export interface MockStockMovement {
	id: Id;
	itemId: Id;
	storeId: Id;
	type: "IN" | "OUT";
	quantity: number;
	reason: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "RETURN" | "DAMAGE" | "OTHER";
	note?: string;
	createdAt: string;
	createdBy: string;
}

export interface MockSalesProduct {
	product_id: Id;
	product_name?: string;
	category?: string;
	total_sold: number;
	total_revenue: number;
	avg_daily_sales: number;
	weekly_trend: number;
	sales_consistency: number;
	sales_forecast: { next_7days: number; confidence: number; interval: [number, number] };
}

export interface MockSalesResponse {
	status: "success";
	store_id: Id;
	analysis_period: number;
	products: MockSalesProduct[];
	trend_analysis?: { weekly_pattern?: Record<string, number> };
	ai_insights?: string;
}

export interface MockStockProduct {
	product_id: Id;
	name?: string;
	current_stock: number;
	price?: number;
	avg_daily_sales: number;
	sales_trend: "increasing" | "decreasing" | "stable";
	estimated_days_left?: number | null;
	estimated_days_left_ci?: [number, number] | [null, null];
	is_critical: boolean;
	reorder_qty_suggestion: number;
	safety_stock: number;
	lead_time_days?: number;
}

export interface MockStockResponse {
	store_id: Id;
	analysis_date: string;
	products: MockStockProduct[];
	critical_products: MockStockProduct[];
	total_value: number;
}

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/* In-memory data */
const now = () => new Date().toISOString();
const randomId = () => Math.random().toString(36).slice(2, 10);
const STORAGE_OK = typeof window !== 'undefined' && !!window.localStorage;

function loadArray<T>(key: string, fallback: T[]): T[] {
	try {
		if (STORAGE_OK) {
			const raw = window.localStorage.getItem(key);
			if (raw) return JSON.parse(raw) as T[];
		}
	} catch {}
	return fallback;
}

function saveArray<T>(key: string, data: T[]): void {
	try {
		if (STORAGE_OK) {
			window.localStorage.setItem(key, JSON.stringify(data));
		}
	} catch {}
}

const LS_ITEMS_KEY = 'mock_items_v1';
const LS_REQUESTS_KEY = 'mock_requests_v1';
const LS_MOVEMENTS_KEY = 'mock_movements_v1';

const stores: MockStore[] = [
	{ id: "s1", name: "İstanbul-Merkez", fullname: "İstanbul Merkez Mağaza", city: "İstanbul", active: true },
	{ id: "s2", name: "Ankara-Çankaya", fullname: "Ankara Çankaya Şube", city: "Ankara", active: true },
	{ id: "s3", name: "İzmir-Kordon", fullname: "İzmir Kordon Şube", city: "İzmir", active: true },
	{ id: "s4", name: "Bursa-Nilüfer", fullname: "Bursa Nilüfer Şube", city: "Bursa", active: true },
	{ id: "s5", name: "Antalya-Konyaaltı", fullname: "Antalya Konyaaltı Şube", city: "Antalya", active: true },
];

const seedItems: MockInventoryItem[] = [
  // İstanbul teknoloji + gıda (s1)
  { id: "i1",  storeId: "s1", sku: "TEL-IPH14",   name: "Akıllı Telefon iPhone 14", price: 45000, stock: 8,  reorderLevel: 5,  category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i2",  storeId: "s1", sku: "LPT-DELLXPS", name: "Dizüstü Dell XPS 13",       price: 52000, stock: 5,  reorderLevel: 3,  category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i3",  storeId: "s1", sku: "TV-SAM-55",   name: "Samsung 55'' TV",           price: 28000, stock: 6,  reorderLevel: 4,  category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i4",  storeId: "s1", sku: "HD-SONYXM4",  name: "Kulaklık Sony XM4",         price: 9000,  stock: 15, reorderLevel: 10, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i5",  storeId: "s1", sku: "GID-KAHVE",   name: "Kahve",                     price: 120,   stock: 45, reorderLevel: 20, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },

  // Ankara teknoloji ağırlık (s2)
  { id: "i6",  storeId: "s2", sku: "TEL-ANDR-PIX7", name: "Akıllı Telefon Pixel 7", price: 32000, stock: 10, reorderLevel: 6, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i7",  storeId: "s2", sku: "LPT-MAC-M2",    name: "Macbook Air M2",         price: 65000, stock: 4,  reorderLevel: 2, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i8",  storeId: "s2", sku: "TV-LG-65",      name: "LG 65'' OLED",            price: 76000, stock: 2,  reorderLevel: 2, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i9",  storeId: "s2", sku: "HD-AIRP2",      name: "AirPods 2",               price: 5500,  stock: 25, reorderLevel: 10,category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // İzmir karışık (s3)
  { id: "i10", storeId: "s3", sku: "TEL-ANDR-S23", name: "Akıllı Telefon Galaxy S23", price: 42000, stock: 7,  reorderLevel: 3,  category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i11", storeId: "s3", sku: "BIL-MON-27",   name: "27'' Monitör",              price: 7000,  stock: 12, reorderLevel: 6,  category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i12", storeId: "s3", sku: "GID-CAY",      name: "Çay",                       price: 90,    stock: 12, reorderLevel: 15, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },

  // Bursa ev elektroniği (s4)
  { id: "i13", storeId: "s4", sku: "TV-PH-50",     name: "Philips 50'' TV",  price: 23000, stock: 9,  reorderLevel: 4, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i14", storeId: "s4", sku: "BIL-PC-GAM",   name: "Oyun Bilgisayarı", price: 38000, stock: 3,  reorderLevel: 2, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i15", storeId: "s4", sku: "EV-SUP-SUPR",  name: "Süpürge",          price: 4500,  stock: 14, reorderLevel: 6, category: "Ev",        isActive: true, createdAt: now(), updatedAt: now() },

  // Antalya günlük (s5)
  { id: "i16", storeId: "s5", sku: "GID-SUT",      name: "Süt",               price: 35,   stock: 80, reorderLevel: 25, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i17", storeId: "s5", sku: "GID-YOG",      name: "Yoğurt",            price: 50,   stock: 60, reorderLevel: 20, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i18", storeId: "s5", sku: "HD-JBL-500",   name: "Kulaklık JBL 500BT",price: 2500, stock: 18, reorderLevel: 8,  category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // ─────────────────────────────
  // Çoklu mağaza kopyaları (aynı ürün + farklı storeId, benzersiz id)
  // ─────────────────────────────

  // iPhone 14 başka mağazalar
  { id: "i19", storeId: "s2", sku: "TEL-IPH14",   name: "Akıllı Telefon iPhone 14", price: 45000, stock: 6,  reorderLevel: 5, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i20", storeId: "s3", sku: "TEL-IPH14",   name: "Akıllı Telefon iPhone 14", price: 45000, stock: 5,  reorderLevel: 5, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // Kahve başka mağazalar
  { id: "i21", storeId: "s2", sku: "GID-KAHVE",   name: "Kahve",                     price: 120,   stock: 30, reorderLevel: 20, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i22", storeId: "s5", sku: "GID-KAHVE",   name: "Kahve",                     price: 120,   stock: 50, reorderLevel: 20, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },

  // AirPods 2 başka mağazalar
  { id: "i23", storeId: "s1", sku: "HD-AIRP2",    name: "AirPods 2",                 price: 5500,  stock: 12, reorderLevel: 10,category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i24", storeId: "s3", sku: "HD-AIRP2",    name: "AirPods 2",                 price: 5500,  stock: 10, reorderLevel: 10,category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // Samsung 55'' TV başka mağaza
  { id: "i25", storeId: "s4", sku: "TV-SAM-55",   name: "Samsung 55'' TV",           price: 28000, stock: 4,  reorderLevel: 4, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // LG 65'' OLED başka mağaza
  { id: "i26", storeId: "s1", sku: "TV-LG-65",    name: "LG 65'' OLED",              price: 76000, stock: 1,  reorderLevel: 2, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // 27'' Monitör başka mağazalar
  { id: "i27", storeId: "s1", sku: "BIL-MON-27",  name: "27'' Monitör",               price: 7000,  stock: 7,  reorderLevel: 6, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },
  { id: "i28", storeId: "s5", sku: "BIL-MON-27",  name: "27'' Monitör",               price: 7000,  stock: 5,  reorderLevel: 6, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // Süt başka mağaza
  { id: "i29", storeId: "s3", sku: "GID-SUT",     name: "Süt",                        price: 35,    stock: 40, reorderLevel: 25, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },

  // Süpürge başka mağaza
  { id: "i30", storeId: "s1", sku: "EV-SUP-SUPR", name: "Süpürge",                    price: 4500,  stock: 10, reorderLevel: 6, category: "Ev",        isActive: true, createdAt: now(), updatedAt: now() },

  // Macbook Air M2 başka mağaza
  { id: "i31", storeId: "s3", sku: "LPT-MAC-M2",  name: "Macbook Air M2",             price: 65000, stock: 3,  reorderLevel: 2, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // Galaxy S23 başka mağaza
  { id: "i32", storeId: "s2", sku: "TEL-ANDR-S23", name: "Akıllı Telefon Galaxy S23", price: 42000, stock: 4,  reorderLevel: 3, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // JBL 500BT başka mağaza
  { id: "i33", storeId: "s1", sku: "HD-JBL-500",  name: "Kulaklık JBL 500BT",         price: 2500,  stock: 9,  reorderLevel: 8, category: "Teknoloji", isActive: true, createdAt: now(), updatedAt: now() },

  // Çay başka mağaza
  { id: "i34", storeId: "s5", sku: "GID-CAY",     name: "Çay",                        price: 90,    stock: 25, reorderLevel: 15, category: "Gıda",      isActive: true, createdAt: now(), updatedAt: now() },
];

let items: MockInventoryItem[] = loadArray<MockInventoryItem>(LS_ITEMS_KEY, seedItems.slice());


let requests: MockStockRequest[] = loadArray<MockStockRequest>(LS_REQUESTS_KEY, [
	{ id: "r1", itemId: "i2", sku: "SKU-002", name: "Çay", requesterStoreId: "s1", targetStoreId: "s2", quantity: 10, status: "pending", createdAt: now(), updatedAt: now(), note: "Acil" },
]);

let movements: MockStockMovement[] = loadArray<MockStockMovement>(LS_MOVEMENTS_KEY, [
	// Örnek stok hareketleri
	{ id: "m1", itemId: "i1", storeId: "s1", type: "IN", quantity: 10, reason: "PURCHASE", note: "İlk stok girişi", createdAt: now(), createdBy: "admin" },
	{ id: "m2", itemId: "i1", storeId: "s1", type: "OUT", quantity: 2, reason: "SALE", note: "Satış", createdAt: now(), createdBy: "admin" },
	{ id: "m3", itemId: "i2", storeId: "s1", type: "IN", quantity: 5, reason: "PURCHASE", note: "Yeni sipariş", createdAt: now(), createdBy: "admin" },
	{ id: "m4", itemId: "i3", storeId: "s1", type: "OUT", quantity: 1, reason: "SALE", note: "Satış", createdAt: now(), createdBy: "admin" },
	{ id: "m5", itemId: "i4", storeId: "s1", type: "IN", quantity: 20, reason: "PURCHASE", note: "Toplu alım", createdAt: now(), createdBy: "admin" },
	{ id: "m6", itemId: "i5", storeId: "s1", type: "OUT", quantity: 5, reason: "SALE", note: "Satış", createdAt: now(), createdBy: "admin" },
]);

/* Stores */
export async function mockGetStores(): Promise<MockStore[]> {
	await delay(150);
	return stores.slice();
}

/* Inventory */
export async function mockListItems(params: {
	storeId: string;
	q?: string;
	page?: number;
	size?: number;
	category?: string;
	isActive?: boolean;
	sort?: string;
}): Promise<{ items: MockInventoryItem[]; total: number }> {
	await delay(200);
	let list = items.filter((x) => x.storeId === params.storeId);
	if (params.q) {
		const q = params.q.toLowerCase();
		list = list.filter((x) => x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q));
	}
	if (params.category) list = list.filter((x) => x.category === params.category);
	if (params.isActive !== undefined) list = list.filter((x) => x.isActive === params.isActive);
	
	// Sıralama işlemi
	if (params.sort) {
		switch (params.sort) {
			case 'name':
				list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
				break;
			case 'name-desc':
				list.sort((a, b) => b.name.localeCompare(a.name, 'tr'));
				break;
			case 'stock':
				list.sort((a, b) => a.stock - b.stock);
				break;
			case 'stock-desc':
				list.sort((a, b) => b.stock - a.stock);
				break;
			case 'price':
				list.sort((a, b) => a.price - b.price);
				break;
			case 'price-desc':
				list.sort((a, b) => b.price - a.price);
				break;
			case 'createdAt':
				list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
				break;
			case 'createdAt-desc':
				list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				break;
			default:
				// Varsayılan olarak isme göre sırala
				list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
		}
	}
	
	const total = list.length;
	const page = params.page ?? 1;
	const size = params.size ?? 20;
	const start = (page - 1) * size;
	const paged = list.slice(start, start + size);
	return { items: paged, total };
}

export async function mockCreateItem(payload: Omit<MockInventoryItem, "id" | "createdAt" | "updatedAt">): Promise<MockInventoryItem> {
	await delay(200);
	const created: MockInventoryItem = { ...payload, id: randomId(), createdAt: now(), updatedAt: now() };
	items.push(created);
	saveArray(LS_ITEMS_KEY, items);
	return created;
}

export async function mockUpdateItem(id: string, patch: DeepPartial<MockInventoryItem>): Promise<MockInventoryItem> {
	await delay(200);
	const idx = items.findIndex((x) => x.id === id);
	if (idx === -1) throw new Error("Item not found");
	items[idx] = { ...items[idx], ...patch, updatedAt: now() } as MockInventoryItem;
	saveArray(LS_ITEMS_KEY, items);
	return items[idx];
}

export async function mockDeleteItem(id: string): Promise<{ ok: boolean }> {
	await delay(150);
	const len = items.length;
	for (let i = items.length - 1; i >= 0; i--) if (items[i].id === id) items.splice(i, 1);
	saveArray(LS_ITEMS_KEY, items);
	return { ok: len !== items.length };
}

export async function mockGetAvailability(sku: string): Promise<Array<{ storeId: string; storeName: string; stock: number }>> {
	await delay(150);
	const perStore: Record<string, number> = {};
	for (const it of items.filter((x) => x.sku === sku)) {
		perStore[it.storeId] = (perStore[it.storeId] ?? 0) + it.stock;
	}
	return Object.entries(perStore).map(([storeId, stock]) => ({ storeId, storeName: stores.find((s) => s.id === storeId)?.name || storeId, stock }));
}

/* Requests */
export async function mockCreateRequest(body: {
	requesterStoreId: string;
	targetStoreId?: string;
	itemId: string;
	quantity: number;
	note?: string;
}): Promise<MockStockRequest> {
	await delay(200);
	const item = items.find((x) => x.id === body.itemId);
	const req: MockStockRequest = {
		id: randomId(),
		itemId: body.itemId,
		sku: item?.sku || "",
		name: item?.name || "",
		requesterStoreId: body.requesterStoreId,
		targetStoreId: body.targetStoreId ?? null,
		quantity: body.quantity,
		status: "pending",
		createdAt: now(),
		updatedAt: now(),
		note: body.note,
	};
	requests.push(req);
	saveArray(LS_REQUESTS_KEY, requests);
	return req;
}

export async function mockListRequests(params: { storeId: string; role: "requester" | "target" | "all" }): Promise<MockStockRequest[]> {
	await delay(150);
	return requests.filter((r) =>
		params.role === "all" ? (r.requesterStoreId === params.storeId || r.targetStoreId === params.storeId)
		: params.role === "requester" ? r.requesterStoreId === params.storeId
		: r.targetStoreId === params.storeId
	);
}

export async function mockTransferStock(body: { itemId: string; quantity: number; fromStoreId: string; toStoreId: string; note?: string; }): Promise<{ ok: boolean }> {
	await delay(150);
	const srcItemIdx = items.findIndex((x) => x.id === body.itemId && x.storeId === body.fromStoreId);
	if (srcItemIdx === -1) throw new Error("Source item not found");
	const srcItem = items[srcItemIdx];
	const moved = Math.min(srcItem.stock, Math.max(0, body.quantity));
	srcItem.stock = Math.max(0, srcItem.stock - moved);
	let dstItem = items.find((x) => x.sku === srcItem.sku && x.storeId === body.toStoreId);
	if (!dstItem) {
		dstItem = {
			id: randomId(), storeId: body.toStoreId, sku: srcItem.sku, name: srcItem.name,
			price: srcItem.price, stock: 0, reorderLevel: srcItem.reorderLevel ?? null,
			category: srcItem.category ?? null, isActive: true, createdAt: now(), updatedAt: now(),
		};
		items.push(dstItem);
	}
	dstItem.stock += moved;

	// Stok hareketi kayıtları oluştur
	const outMovement: MockStockMovement = {
		id: randomId(),
		itemId: body.itemId,
		storeId: body.fromStoreId,
		type: "OUT",
		quantity: moved,
		reason: "TRANSFER_OUT",
		note: body.note || `Transfer to ${body.toStoreId}`,
		createdAt: now(),
		createdBy: "system"
	};
	movements.push(outMovement);

	const inMovement: MockStockMovement = {
		id: randomId(),
		itemId: dstItem.id,
		storeId: body.toStoreId,
		type: "IN",
		quantity: moved,
		reason: "TRANSFER_IN",
		note: body.note || `Transfer from ${body.fromStoreId}`,
		createdAt: now(),
		createdBy: "system"
	};
	movements.push(inMovement);

	// persist arrays
	saveArray(LS_ITEMS_KEY, items);
	saveArray(LS_MOVEMENTS_KEY, movements);

	return { ok: true };
}

export async function mockUpdateRequest(id: string, patch: { status: "approved" | "rejected" | "fulfilled"; decisionNote?: string }): Promise<MockStockRequest> {
	await delay(150);
	const idx = requests.findIndex((r) => r.id === id);
	if (idx === -1) throw new Error("Request not found");
	const prev = requests[idx];
	const updated = { ...prev, ...patch, updatedAt: now() } as MockStockRequest;
	requests[idx] = updated;
	saveArray(LS_REQUESTS_KEY, requests);

	// Auto-fulfill stock move logic: when status becomes fulfilled, move quantity from target->requester if available
	if (patch.status === "fulfilled") {
		const srcStore = updated.targetStoreId || null;
		const dstStore = updated.requesterStoreId;
		if (srcStore && dstStore && srcStore !== dstStore) {
			const srcItem = items.find((x) => x.id === updated.itemId && x.storeId === srcStore);
			const dstItem = items.find((x) => x.sku === updated.sku && x.storeId === dstStore);
			if (srcItem) srcItem.stock = Math.max(0, srcItem.stock - updated.quantity);
			if (dstItem) dstItem.stock += updated.quantity;
			else if (srcItem) {
				// create new line in destination store mirroring src item basic fields
				items.push({
					id: randomId(), storeId: dstStore, sku: srcItem.sku, name: srcItem.name,
					price: srcItem.price, stock: updated.quantity, reorderLevel: srcItem.reorderLevel ?? null,
					category: srcItem.category ?? null, isActive: true, createdAt: now(), updatedAt: now()
				});
			}
			// persist items after fulfill
			saveArray(LS_ITEMS_KEY, items);
		}
	}
	return updated;
}

/* Movements */
export async function mockListMovements(params: {
	storeId: string;
	itemId?: string;
	type?: "IN" | "OUT";
	dateFrom?: string;
	dateTo?: string;
	page?: number;
	size?: number;
	sort?: string;
}): Promise<{ items: MockStockMovement[]; total: number }> {
	await delay(150);
	let list = movements.filter((x) => x.storeId === params.storeId);
	
	if (params.itemId) list = list.filter((x) => x.itemId === params.itemId);
	if (params.type) list = list.filter((x) => x.type === params.type);
	if (params.dateFrom) {
		const fromDate = new Date(params.dateFrom);
		list = list.filter((x) => new Date(x.createdAt) >= fromDate);
	}
	if (params.dateTo) {
		const toDate = new Date(params.dateTo);
		list = list.filter((x) => new Date(x.createdAt) <= toDate);
	}

	// Sıralama
	if (params.sort) {
		const isDesc = params.sort.startsWith('-');
		const sortField = isDesc ? params.sort.slice(1) : params.sort;
		
		switch (sortField) {
			case 'createdAt':
				list.sort((a, b) => {
					const result = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					return isDesc ? -result : result;
				});
				break;
			case 'quantity':
				list.sort((a, b) => {
					const result = a.quantity - b.quantity;
					return isDesc ? -result : result;
				});
				break;
			case 'type':
				list.sort((a, b) => {
					const result = a.type.localeCompare(b.type);
					return isDesc ? -result : result;
				});
				break;
			default:
				// Varsayılan olarak tarihe göre azalan sırala
				list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
		}
	} else {
		// Varsayılan sıralama: en yeni önce
		list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	const total = list.length;
	const page = params.page ?? 1;
	const size = params.size ?? 20;
	const start = (page - 1) * size;
	const paged = list.slice(start, start + size);
	
	return { items: paged, total };
}

export async function mockCreateMovement(body: {
	itemId: string;
	storeId: string;
	type: "IN" | "OUT";
	quantity: number;
	reason: "PURCHASE" | "SALE" | "ADJUSTMENT" | "TRANSFER_IN" | "TRANSFER_OUT" | "RETURN" | "DAMAGE" | "OTHER";
	note?: string;
	createdBy: string;
}): Promise<MockStockMovement> {
	await delay(150);
	const movement: MockStockMovement = {
		id: randomId(),
		itemId: body.itemId,
		storeId: body.storeId,
		type: body.type,
		quantity: body.quantity,
		reason: body.reason,
		note: body.note,
		createdAt: now(),
		createdBy: body.createdBy,
	};
	movements.push(movement);

	// Stok miktarını güncelle
	const item = items.find((x) => x.id === body.itemId && x.storeId === body.storeId);
	if (item) {
		if (body.type === "IN") {
			item.stock += body.quantity;
		} else {
			item.stock = Math.max(0, item.stock - body.quantity);
		}
		item.updatedAt = now();
	}

	// persist arrays
	saveArray(LS_ITEMS_KEY, items);
	saveArray(LS_MOVEMENTS_KEY, movements);

	return movement;
}

/* Alerts */
export async function mockListAlerts(params: { storeId: string; onlyOpen?: boolean }): Promise<{ items: MockLowStockAlert[] }> {
	await delay(120);
	const list: MockLowStockAlert[] = items
		.filter((x) => x.storeId === params.storeId && x.reorderLevel != null && x.stock <= (x.reorderLevel as number))
		.map((x) => ({ itemId: x.id, sku: x.sku, name: x.name, stock: x.stock, reorderLevel: (x.reorderLevel as number), daysToDeplete: Math.max(1, Math.round((x.stock || 1) / Math.max(1, Math.round((x.price || 10) / 10)))), isAcknowledged: false }));
	return { items: params.onlyOpen ? list.filter((a) => !a.isAcknowledged) : list };
}

/* Sales / Stock */
export async function mockGetSales(storeId: string): Promise<MockSalesResponse> {
	await delay(220);
	const related = items.filter((x) => x.storeId === storeId);
	const products = related.map<MockSalesProduct>((x) => ({
		product_id: x.id,
		product_name: x.name,
		category: x.category || undefined,
		total_sold: Math.round(x.stock * 3),
		total_revenue: Math.round(x.price * (x.stock * 3)),
		avg_daily_sales: Math.max(1, Math.round(x.stock / 7)),
		weekly_trend: Math.round((Math.random() - 0.5) * 10),
		sales_consistency: Math.round(60 + Math.random() * 40),
		sales_forecast: { next_7days: Math.round(5 + Math.random() * 20), confidence: 0.8, interval: [5, 25] },
	}));
	return { status: "success", store_id: storeId, analysis_period: 30, products, trend_analysis: { weekly_pattern: { Mon: 10, Tue: 12, Wed: 9, Thu: 11, Fri: 15, Sat: 18, Sun: 14 } }, ai_insights: "Talep istikrarlı." };
}

export async function mockGetStock(storeId: string): Promise<MockStockResponse> {
	await delay(220);
	const related = items.filter((x) => x.storeId === storeId);
	const products = related.map<MockStockProduct>((x) => ({
		product_id: x.id,
		name: x.name,
		current_stock: x.stock,
		price: x.price,
		avg_daily_sales: Math.max(1, Math.round(x.stock / 7)),
		sales_trend: Math.random() > 0.6 ? "increasing" : (Math.random() > 0.5 ? "decreasing" : "stable"),
		estimated_days_left: Math.round(x.stock / Math.max(1, Math.round(x.stock / 7))),
		estimated_days_left_ci: [2, 14],
		is_critical: (x.reorderLevel ?? 0) >= x.stock,
		reorder_qty_suggestion: Math.max(0, (x.reorderLevel ?? 0) * 2 - x.stock),
		safety_stock: Math.round((x.reorderLevel ?? 10) * 0.8),
		lead_time_days: 3,
	}));
	return { store_id: storeId, analysis_date: now(), products, critical_products: products.filter((p) => p.is_critical), total_value: products.reduce((s, p) => s + (p.price || 0) * p.current_stock, 0) };
}

/* Report / Orchestrate */
export async function mockBuildReport(storeId: string, request = "standart rapor"): Promise<{ format: "html"; path: string; html_path: string; pdf_path: null; spec: any; public_url: string; download_url: string; }> {
	await delay(200);
	const path = `/reports/mock-${storeId}.html`;
	return { format: "html", path, html_path: path, pdf_path: null, spec: { request }, public_url: path, download_url: path };
}

export async function mockOrchestrate(q: string, storeId: string): Promise<{ intent: "sales" | "stock" | "report" | "general"; data?: any; artifacts?: { report_path?: string; format?: string }; public_url?: string; download_url?: string; reply?: string; meta?: any; }> {
	await delay(200);
	const lc = q.toLowerCase();
	const isGreeting = /\b(merhaba|selam|hello|hi|g\u00fcnayd\u0131n|iyi ak\u015famlar|nas\u0131ls\u0131n)\b/.test(lc);
	if (isGreeting || lc.trim().length < 3) {
		const reply = "Merhaba! Size nasıl yardımcı olabilirim? Satış analizi, stok durumu ya da rapor üretimi talep edebilirsiniz.";
		return { intent: "general", reply, meta: { planner: "mock", summarizer: "mock", cached: false } };
	}
	const intent: "sales" | "stock" | "report" = lc.includes("stok") || lc.includes("envanter")
		? "stock"
		: (lc.includes("rapor") || lc.includes("pdf"))
		? "report"
		: "sales";

	if (intent === "sales") {
		const data = await mockGetSales(storeId);
		const totalRevenue = data.products.reduce((s, p) => s + (p.total_revenue || 0), 0);
		const top = [...data.products].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))[0];
		const reply = `Satış analizi hazır. Toplam ciro ${totalRevenue.toLocaleString('tr-TR')} TL. En çok ciro: ${top?.product_name ?? 'Bilinmiyor'}.`;
		return { intent, data, reply, meta: { planner: "mock", summarizer: "mock", cached: false } };
	}

	if (intent === "stock") {
		const data = await mockGetStock(storeId);
		const critical = data.critical_products.length;
		const reply = `Stok analizi hazır. Kritik ürün sayısı ${critical}. Toplam stok değeri ${Number(data.total_value || 0).toLocaleString('tr-TR')} TL.`;
		return { intent, data, reply, meta: { planner: "mock", summarizer: "mock", cached: false } };
	}

	const rep = await mockBuildReport(storeId, q);
	const reply = `Rapor oluşturuldu. Bağlantı üzerinden görüntüleyebilirsiniz.`;
	return { intent, artifacts: { report_path: rep.path, format: rep.format }, public_url: rep.public_url, download_url: rep.download_url, reply, meta: { planner: "mock", summarizer: "mock", cached: false } };
}

/* Utils */
function delay(ms: number) { return new Promise((res) => setTimeout(res, ms)); }

export const __mock = { stores, items, requests, movements };


