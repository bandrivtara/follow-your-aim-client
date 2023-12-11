import {
  collection,
  doc,
  updateDoc,
  getDocs,
  addDoc,
  getDoc,
} from "firebase/firestore";
import { ILifeSphere, ISphereData } from "../../types/lifeSpheres.types";
import { api, db } from "../api";

export const spheresFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSpheresList: builder.query<ISphereData[], void>({
      async queryFn() {
        try {
          const ref = collection(db, "sphere");
          const querySnapshot = await getDocs(ref);
          let spheresList: ISphereData[] = [];
          querySnapshot?.forEach((doc) => {
            spheresList.push({
              id: doc.id,
              ...doc.data(),
            } as ISphereData);
          });

          return { data: spheresList };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Spheres"],
    }),

    getSphere: builder.query({
      async queryFn(spheresId) {
        try {
          const spheresRef = doc(db, "sphere", spheresId);
          const spheresSnapshot = await getDoc(spheresRef);
          if (spheresSnapshot.exists()) {
            return {
              data: {
                id: spheresSnapshot.id,
                ...spheresSnapshot.data(),
              } as ISphereData,
            };
          }

          throw new Error("Spheres not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["Spheres"],
    }),

    addSphere: builder.mutation({
      async queryFn(spheresDetails: ILifeSphere) {
        try {
          await addDoc(collection(db, "sphere"), spheresDetails);
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Spheres"],
    }),
    updateSphere: builder.mutation({
      async queryFn(spheresDetails) {
        try {
          console.log(spheresDetails, 555);
          await updateDoc(
            doc(db, "sphere", spheresDetails.id),
            spheresDetails.data
          );
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["Spheres"],
    }),
  }),
});

export const {
  useGetSphereQuery,
  useGetSpheresListQuery,
  useAddSphereMutation,
  useUpdateSphereMutation,
} = spheresFirestoreApi;
