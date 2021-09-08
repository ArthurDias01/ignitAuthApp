import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";


export default function Dashboard() {


  const { user } = useAuth();

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
  }, []);

  return (
    <h1 style={{ font: 'sans-serif', fontSize: '2rem' }}>{`Dashboard ${user?.email}`}</h1>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');
  console.log(response.data)

  return {
    props: {}
  }
})
