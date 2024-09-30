import { AxiosInstance, AxiosResponse } from "axios";

export const uploadForm = async ({
  form,
  axios,
}: {
  form: FormData;
  axios: AxiosInstance;
  }): Promise<AxiosResponse | void> => {
  console.log(form.keys());
  const response = await axios.post("/kyc/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
};
