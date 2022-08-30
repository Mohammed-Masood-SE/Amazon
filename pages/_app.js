import "../styles/globals.css";
import { MoralisProvider } from "react-moralis";
import Layout from "./components/Layout";
function MyApp({ Component, pageProps }) {
  return (
    <MoralisProvider
      appId="dx2VSMbBVnzIZE9gxiXE1oXf1SlNik85DpzjfABt"
      serverUrl="https://hpiuvm4pjols.usemoralis.com:2053/server"
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </MoralisProvider>
  );
}

export default MyApp;
