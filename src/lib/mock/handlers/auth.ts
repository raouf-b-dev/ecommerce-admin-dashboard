import { http, HttpResponse } from 'msw';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_ROLE,
  DEMO_ADMIN_USER_ID,
  DEMO_OPERATOR_PERMISSIONS,
  DEMO_CATALOG_OPERATOR_EMAIL,
  DEMO_CATALOG_OPERATOR_ROLE,
  DEMO_CATALOG_OPERATOR_USER_ID,
  DEMO_CATALOG_OPERATOR_PERMISSIONS,
} from '@/lib/mock/constants';
import {
  getMockSessionUserEmail,
  isMockSessionActive,
  setMockSessionActive,
} from '@/lib/mock/data/store';
import { createMockJwt } from '@/lib/mock/lib/jwt';

function adminTokensBody() {
  const accessToken = createMockJwt({
    sub: DEMO_ADMIN_USER_ID,
    email: DEMO_ADMIN_EMAIL,
    role: DEMO_ADMIN_ROLE,
  });

  return {
    accessToken,
    mustChangePassword: false,
    permissions: [...DEMO_OPERATOR_PERMISSIONS],
  };
}

function catalogOperatorTokensBody() {
  const accessToken = createMockJwt({
    sub: DEMO_CATALOG_OPERATOR_USER_ID,
    email: DEMO_CATALOG_OPERATOR_EMAIL,
    role: DEMO_CATALOG_OPERATOR_ROLE,
  });

  return {
    accessToken,
    mustChangePassword: false,
    permissions: [...DEMO_CATALOG_OPERATOR_PERMISSIONS],
  };
}

function getTokensForCurrentUser(): ReturnType<typeof adminTokensBody> {
  const email = getMockSessionUserEmail();
  if (email === DEMO_CATALOG_OPERATOR_EMAIL) {
    return catalogOperatorTokensBody();
  }
  return adminTokensBody();
}

export const authHandlers = [
  http.post('*/v1/authentication/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (body.email === DEMO_CATALOG_OPERATOR_EMAIL && body.password) {
      setMockSessionActive(true, DEMO_CATALOG_OPERATOR_EMAIL);
      return HttpResponse.json(catalogOperatorTokensBody());
    }

    if (body.email !== DEMO_ADMIN_EMAIL || !body.password) {
      return HttpResponse.json(
        { message: 'Invalid credentials', statusCode: 401 },
        { status: 401 },
      );
    }

    setMockSessionActive(true, DEMO_ADMIN_EMAIL);
    return HttpResponse.json(adminTokensBody());
  }),

  http.post('*/v1/authentication/refresh', () => {
    if (!isMockSessionActive()) {
      return new HttpResponse(null, { status: 401 });
    }

    return HttpResponse.json(getTokensForCurrentUser());
  }),

  http.post('*/v1/authentication/logout', () => {
    setMockSessionActive(false);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/v1/authentication/change-password', async ({ request }) => {
    if (!isMockSessionActive()) {
      return new HttpResponse(null, { status: 401 });
    }

    const body = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!body.currentPassword || !body.newPassword) {
      return HttpResponse.json(
        { message: 'Invalid password change request', statusCode: 400 },
        { status: 400 },
      );
    }

    return HttpResponse.json(getTokensForCurrentUser());
  }),
];
