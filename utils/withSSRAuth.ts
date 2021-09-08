import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from '../errors/AuthTokenError';

export function withSSRAuth<P>(fn: GetServerSideProps<P>): GetServerSideProps {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    if (!cookies['NextAuth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }
    try {
      return await fn(ctx);
    } catch (err) {
      if (err instanceof AuthTokenError) {
        console.log('ERRO AUTHTOKEN', err instanceof AuthTokenError);
        destroyCookie(ctx, 'NextAuth.token');
        destroyCookie(ctx, 'NextAuth.refreshToken');
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }

    }
  }
}
