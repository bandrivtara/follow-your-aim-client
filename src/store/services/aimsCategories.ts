import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  IAimsCategory,
  IAimsCategoryData,
} from "../../types/aimsCategories.types";
import { api, db } from "../api";

export const aimsCategoriesFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAimsCategoriesList: builder.query<IAimsCategoryData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "aimsCategories");
          const querySnapshot = await getDocs(ref);
          let aimsCategoriesList: IAimsCategoryData[] = [];
          querySnapshot?.forEach((doc) => {
            aimsCategoriesList.push({
              id: doc.id,
              ...doc.data(),
            } as IAimsCategoryData);
          });

          return { data: aimsCategoriesList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["AimsCategories"],
    }),

    getAimsCategory: builder.query({
      async queryFn(aimsCategoriesId) {
        try {
          const aimsCategoriesRef = doc(db, "aimsCategories", aimsCategoriesId);
          const aimsCategoriesSnapshot = await getDoc(aimsCategoriesRef);
          if (aimsCategoriesSnapshot.exists()) {
            return {
              data: {
                id: aimsCategoriesSnapshot.id,
                ...aimsCategoriesSnapshot.data(),
              } as IAimsCategoryData,
            };
          }

          throw new Error("AimsCategories not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["AimsCategories"],
    }),

    addAimsCategory: builder.mutation({
      async queryFn(aimsCategoriesDetails: IAimsCategory) {
        try {
          await addDoc(collection(db, "aimsCategories"), aimsCategoriesDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["AimsCategories"],
    }),
    updateAimsCategory: builder.mutation({
      async queryFn(aimsCategoriesDetails) {
        try {
          await setDoc(
            doc(db, "aimsCategories", aimsCategoriesDetails.id),
            aimsCategoriesDetails.data
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message, 333);
          return { error: error.message };
        }
      },
      invalidatesTags: ["AimsCategories"],
    }),
  }),
});

export const {
  useGetAimsCategoryQuery,
  useGetAimsCategoriesListQuery,
  useAddAimsCategoryMutation,
  useUpdateAimsCategoryMutation,
} = aimsCategoriesFirestoreApi;
