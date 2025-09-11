import { __mock } from "./index";

type LoginPayload = { email?: string; socialCode?: string; password: string };

export async function mockLogin(payload: LoginPayload): Promise<{
	accessToken: string;
	refreshToken: string;
	data: { user: { id: string; fullname: string; role: string; assignedStoreIds: string[] } };
}> {
	await new Promise((r) => setTimeout(r, 150));
	const name = payload.email
		? (payload.email.split("@")[0] || "Kullanıcı")
		: (payload.socialCode || "Kullanıcı");
	const assigned = __mock.stores.length > 0 ? [__mock.stores[0].id] : [];
	return {
		accessToken: `mock.${btoa(name)}.${Date.now()}`,
		refreshToken: `mockref.${Date.now()}`,
		data: {
			user: {
				id: "me",
				fullname: name,
				role: "Kullanıcı",
				assignedStoreIds: assigned,
			},
		},
	};
}


