import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
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

    getCategory: builder.query({
      async queryFn(aimsCategoriesId) {
        try {
          const aimsCategoriesRef = doc(db, "sphere", aimsCategoriesId);
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

    addCategory: builder.mutation({
      async queryFn(aimsCategoriesDetails: IAimsCategory) {
        try {
          await addDoc(collection(db, "sphere"), aimsCategoriesDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["AimsCategories"],
    }),
    updateCategory: builder.mutation({
      async queryFn(aimsCategoriesDetails) {
        try {
          console.log(aimsCategoriesDetails, 555);
          await updateDoc(
            doc(db, "sphere", aimsCategoriesDetails.id),
            aimsCategoriesDetails.data
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["AimsCategories"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useGetAimsCategoriesListQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} = aimsCategoriesFirestoreApi;
