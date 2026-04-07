import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Helper to validate request body against Zod schema
 */
export function validateRequest<S extends z.ZodSchema>(
  schema: S,
  data: unknown
): { success: boolean; data?: z.infer<S>; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated as z.infer<S> };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${err.errors[0]?.message ?? 'Invalid input'}`,
      };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Helper to check authentication and get current user/org context
 */
export async function withAuth(request: NextRequest) {
  const { userId, orgId } = await auth();

  if (!userId) {
    return {
      authenticated: false,
      userId: null,
      orgId: null,
      error: 'Unauthorized',
    };
  }

  return {
    authenticated: true,
    userId,
    orgId,
    error: null,
  };
}

/**
 * Helper to create a standardized JSON response
 */
export function jsonResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: statusCode >= 200 && statusCode < 300,
      data: statusCode >= 200 && statusCode < 300 ? data : undefined,
      error: statusCode >= 400 ? (data as any) : undefined,
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Helper to create an error response
 */
export function errorResponse(
  message: string,
  statusCode: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      statusCode,
    },
    { status: statusCode }
  );
}

/**
 * Helper for unauthorized responses
 */
export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse('Unauthorized', 401);
}

/**
 * Helper for forbidden responses
 */
export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse('Forbidden', 403);
}

/**
 * Helper for not found responses
 */
export function notFoundResponse(): NextResponse<ApiResponse> {
  return errorResponse('Not found', 404);
}
