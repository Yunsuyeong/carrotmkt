import type { NextPage } from "next";
import Button from "@components/button";
import Layout from "@components/layout";
import { useRouter } from "next/router";
import useSWR, { useSWRConfig } from "swr";
import Link from "next/link";
import { Postscript, Product, Reservation, User } from "@prisma/client";
import useMutation from "@libs/client/useMutation";
import { cls } from "@libs/client/utils";
import useUser from "@libs/client/useUser";

interface ProductWithUser extends Product {
  user: User;
}

export interface ItemDetailResponse {
  ok: boolean;
  product: ProductWithUser;
  relatedProduct: Product[];
  ReservedProduct: Product[];
  isLiked: boolean;
  isReserved: boolean;
}

interface PostscriptWithUser extends Postscript {
  createdBy: User;
}

interface PostscriptsResponse {
  ok: boolean;
  postscripts: PostscriptWithUser[];
}

const ItemDetail: NextPage = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { data, mutate: boundMutate } = useSWR<ItemDetailResponse>(
    router.query.id ? `/api/products/${router.query.id}` : null
  );
  const [toggleFav] = useMutation(`/api/products/${router.query.id}/fav`);
  const [toggleReserved] = useMutation(
    `/api/products/${router.query.id}/reserved`
  );
  const onFavClick = () => {
    toggleFav({});
    if (!data) return;
    boundMutate((prev) => prev && { ...prev, isLiked: !prev.isLiked }, false);
    // mutate("/api/users/me", (prev: any) => ({ ok: !prev .ok }), false);
  };
  const onReservedClick = () => {
    toggleReserved({});
    if (!data) return;
    boundMutate(
      (prev) => prev && { ...prev, isReserved: !prev.isReserved },
      false
    );
  };
  const { data: postData } = useSWR<PostscriptsResponse>(
    `/api/products/${router.query.id}/postscript`
  );
  console.log(postData);
  return (
    <Layout seoTitle="Product Detail" canGoBack>
      <div className="px-4  py-4">
        <div className="mb-8">
          <div className="h-96 bg-slate-300" />
          <div className="flex cursor-pointer py-3 border-t border-b items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-slate-300" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {data?.product?.user?.name}
              </p>
              <Link
                legacyBehavior
                href={`/users/profiles/${data?.product?.user?.id}`}
              >
                <a className="text-xs font-medium text-gray-500">
                  View profile &rarr;
                </a>
              </Link>
            </div>
          </div>
          <div className="mt-5">
            <h1 className="text-3xl font-bold text-gray-900">
              {data?.product?.name}
            </h1>
            <span className="text-2xl block mt-3 text-gray-900">
              ${data?.product?.price}
            </span>
            <p className=" my-6 text-gray-700">{data?.product?.description}</p>
            <div className="flex items-center justify-between space-x-2">
              <button
                onClick={onReservedClick}
                className={cls(
                  "w-full text-white px-4 border border-transparent rounded-md shadow-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:outline-none py-3 text-base",
                  data?.isReserved
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-orange-500 hover:bg-orange-600"
                )}
              >
                Talk to seller
              </button>

              <button
                onClick={onFavClick}
                className={cls(
                  "p-3 rounded-md flex items-center justify-center hover:text-gray-100",
                  data?.isLiked
                    ? "text-red-500 hover:bg-red-600"
                    : "text-gray-400 hover:bg-gray-500 "
                )}
              >
                {data?.isLiked ? (
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Similar items</h2>
          <div className=" mt-6 grid grid-cols-2 gap-4">
            {data?.relatedProduct?.map((product) => (
              <Link
                legacyBehavior
                key={product.id}
                href={`/product/${product?.id}`}
              >
                <div>
                  <div className="h-56 w-full mb-4 bg-slate-300" />
                  <h3 className="text-gray-700 -mb-1">{product.name}</h3>
                  <span className="text-sm font-medium text-gray-900">
                    ${product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">작성된 후기</h2>
          <div className=" mt-6 grid grid-cols-2 gap-4">
            {postData?.postscripts?.map((post) => (
              <div key={post.id}>
                <h3 className="text-gray-700 -mb-1">{post.createdBy.name}</h3>
                <span className="text-sm font-medium text-gray-900">
                  {post.postscript}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
export default ItemDetail;
