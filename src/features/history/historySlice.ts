import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react"
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from "firebase/firestore"
import { db } from "../../app/firebase"

export interface Item {
  id: string
  category: string
  categorySub: string
  createDatetime: string
}

type NewItem = Pick<Item, "category" | "categorySub">

export const historySlice = createApi({
  reducerPath: "history",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Item"],
  endpoints: (builder) => ({
    getItems: builder.query<Item[], { lastItem?: Item }>({
      queryFn: async ({ lastItem }) => {
        const itemRef = collection(db, "items")
        const queryConstraints = []
        queryConstraints.push(orderBy("createDatetime", "desc"))
        queryConstraints.push(limit(20))
        if (lastItem) {
          const lastItemDate = Timestamp.fromDate(
            new Date(lastItem.createDatetime),
          )
          queryConstraints.push(startAfter(lastItemDate))
        }
        const q = query(itemRef, ...queryConstraints)
        const querySnapshot = await getDocs(q)
        const items: Item[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          items.push({
            id: doc.id,
            category: data.category as string,
            categorySub: data.categorySub as string,
            createDatetime: new Date(
              (data.createDatetime as Timestamp).seconds * 1000,
            ).toLocaleString(),
          } as Item)
        })
        return { data: items }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Item", id }) as const),
              { type: "Item", id: "LIST" },
            ]
          : [{ type: "Item", id: "LIST" }],
    }),
    addNewItem: builder.mutation<string, NewItem>({
      queryFn: async (item) => {
        // テスト用遅延ロード
        // await new Promise((resolve) => setTimeout(resolve, 2000))
        const docRef = await addDoc(collection(db, "items"), {
          ...item,
          createDatetime: Timestamp.fromDate(new Date()),
        })
        return { data: docRef.id }
      },
      invalidatesTags: [{ type: "Item", id: "LIST" }],
      /*
      invalidatesTags: (result, error, newItem) => [
        { type: "Item", result },
        { type: "Item", id: "PARTIAL-LIST" },
      ],
      */
    }),
  }),
})

export const { useGetItemsQuery, useAddNewItemMutation } = historySlice
