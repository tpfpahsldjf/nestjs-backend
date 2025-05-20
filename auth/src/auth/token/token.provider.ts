
export interface TokenProvider {
  sign(payload: any): string;
  verify(token: string): any;
}

export const TOKEN_PROVIDER = 'TOKEN_PROVIDER';
