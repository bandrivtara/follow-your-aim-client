import {
  collection,
  doc,
  getDocs,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import {
  IGroup,
  IGroupData,
  IWord,
  IWordData,
} from "../../types/english.types";
import { api, db } from "../api";

export const groupsFirestoreApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGroupsList: builder.query<IGroupData[], void>({
      async queryFn() {
        try {
          const groupsRef = doc(db, "english", "groups");
          const groupsSnapshot = await getDoc(groupsRef);
          if (groupsSnapshot.exists()) {
            return {
              data: groupsSnapshot.data() as IGroupData,
            };
          }

          throw new Error("Groups not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["English"],
    }),

    getGroup: builder.query({
      async queryFn(groupsId) {
        try {
          const groupsRef = doc(db, "english", "groups");
          const groupsSnapshot = await getDoc(groupsRef);
          if (groupsSnapshot.exists()) {
            return {
              data: groupsSnapshot.data()[groupsId] as IGroupData,
            };
          }

          throw new Error("Groups not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["English"],
    }),

    updateGroup: builder.mutation({
      async queryFn(group) {
        try {
          const groupRef = doc(db, "english", "groups");
          const groupSnapshot = await getDoc(groupRef);
          const isCurrentMonthExists = groupSnapshot.exists();
          if (!isCurrentMonthExists) {
            await setDoc(doc(db, "english", "groups"), {});
          }
          await updateDoc(groupRef, {
            [group.path]: group.data,
          });
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["English"],
    }),
    getWordsList: builder.query<IWordData[], void>({
      async queryFn() {
        try {
          const groupsRef = doc(db, "english", "words");
          const groupsSnapshot = await getDoc(groupsRef);
          if (groupsSnapshot.exists()) {
            return {
              data: groupsSnapshot.data() as IGroupData,
            };
          }

          throw new Error("Groups not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["English"],
    }),

    getWord: builder.query({
      async queryFn(wordsId) {
        try {
          const wordsRef = doc(db, "english", "words");
          const wordsSnapshot = await getDoc(wordsRef);
          if (wordsSnapshot.exists()) {
            return {
              data: wordsSnapshot.data()[wordsId] as IWordData,
            };
          }

          throw new Error("Words not found");
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      providesTags: ["English"],
    }),

    updateWord: builder.mutation({
      async queryFn(word) {
        try {
          const wordRef = doc(db, "english", "words");
          const wordSnapshot = await getDoc(wordRef);
          const isCurrentMonthExists = wordSnapshot.exists();
          if (!isCurrentMonthExists) {
            await setDoc(doc(db, "english", "words"), {});
          }
          await updateDoc(wordRef, {
            [word.path]: word.data,
          });
          return { data: null };
        } catch (error: any) {
          console.error(error.message);
          return { error: error.message };
        }
      },
      invalidatesTags: ["English"],
    }),
  }),
});

export const {
  useGetGroupQuery,
  useGetGroupsListQuery,
  useUpdateGroupMutation,
  useGetWordQuery,
  useGetWordsListQuery,
  useUpdateWordMutation,
} = groupsFirestoreApi;
