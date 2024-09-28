import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/home/Home";
import NotFound from "./pages/notfound/NotFound";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "react-query";
import VerifyAuth from "./setup/VerifyAuth";
import Upload from "./pages/upload/Upload";
import AuthPage from "./pages/auth/AuthPage";

function App() {
  const client = new QueryClient();
  return (
    <QueryClientProvider client={client}>
      <div className="App h-screen w-screen">
        <Routes>
          <Route path="/">
            <Route index element={<HomePage />} />

            <Route element={<VerifyAuth />}>
              <Route path="/upload" element={<Upload />} />
            </Route>
            
            <Route
              path="/auth/*"
              element={
                <GoogleOAuthProvider clientId="168245098231-7q552uqbffg3lf5f6hp841jju1fluf9b.apps.googleusercontent.com">
                  <AuthPage />
                </GoogleOAuthProvider>
              }
            />

            <Route path="/*" element={<NotFound />} />
          </Route>
        </Routes>
        <ToastContainer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
