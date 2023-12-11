import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { IAim, IAimData } from "../../types/aim.types";
import { api, db } from "../api";

export const aimsFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAimsList: builder.query<IAimData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "aim");
          const querySnapshot = await getDocs(ref);
          let aimsList: IAimData[] = [];
          querySnapshot?.forEach((doc) => {
            aimsList.push({
              id: doc.id,
              ...doc.data(),
            } as IAimData);
          });

          return { data: aimsList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Aims"],
    }),

    getAim: builder.query({
      async queryFn(aimsId) {
        try {
          const aimsRef = doc(db, "aim", aimsId);
          const aimsSnapshot = await getDoc(aimsRef);
          if (aimsSnapshot.exists()) {
            return {
              data: {
                id: aimsSnapshot.id,
                ...aimsSnapshot.data(),
              } as IAimData,
            };
          }

          throw new Error("Aims not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Aims"],
    }),

    addAim: builder.mutation({
      async queryFn(aimsDetails: IAim) {
        try {
          await addDoc(collection(db, "aim"), aimsDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Aims"],
    }),
    updateAim: builder.mutation({
      async queryFn(aimsDetails) {
        try {
          console.log(aimsDetails, 555);
          await updateDoc(doc(db, "aim", aimsDetails.id), aimsDetails.data);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Aims"],
    }),
  }),
});

export const {
  useGetAimQuery,
  useGetAimsListQuery,
  useAddAimMutation,
  useUpdateAimMutation,
} = aimsFirestoreApi;
