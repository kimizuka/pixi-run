import '../styles/globals.scss';

function Layout({ Component, pageProps }) {
  return <Component { ...pageProps } />
}

export default Layout;
