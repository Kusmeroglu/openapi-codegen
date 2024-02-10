"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFetcher = void 0;
const case_1 = require("case");
/**
 * Get fetcher template
 *
 * @param contextPath import the context from another file
 */
const getFetcher = ({ prefix, contextPath, baseUrl, }) => `${contextPath
    ? `import { ${(0, case_1.pascal)(prefix)}Context } from "./${contextPath}";`
    : `export type ${(0, case_1.pascal)(prefix)}FetcherExtraProps = {
      /**
       * You can add some extra props to your generated fetchers.
       *
       * Note: You need to re-gen after adding the first property to
       * have the \`${(0, case_1.pascal)(prefix)}FetcherExtraProps\` injected in \`${(0, case_1.pascal)(prefix)}Components.ts\`
       **/
    }`}

const baseUrl = ${baseUrl ? `"${baseUrl}"` : `""; // TODO add your baseUrl`}

export type ErrorWrapper<TError> =
  | TError
  | { status: "unknown"; payload: string };

export type ${(0, case_1.pascal)(prefix)}FetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string;
  method: string;
  body?: TBody;
  headers?: THeaders;
  queryParams?: TQueryParams;
  pathParams?: TPathParams;
  signal?: AbortSignal;
} & ${contextPath
    ? `${(0, case_1.pascal)(prefix)}Context["fetcherOptions"];`
    : `${(0, case_1.pascal)(prefix)}FetcherExtraProps`}

export async function ${(0, case_1.camel)(prefix)}Fetch<
  TData,
  TError,
  TBody extends {} | FormData | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>({
  url,
  method,
  body,
  headers,
  pathParams,
  queryParams,
  signal,
}: ${(0, case_1.pascal)(prefix)}FetcherOptions<
  TBody,
  THeaders,
  TQueryParams,
  TPathParams
>): Promise<TData> {
  try {
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
      ...headers
    };

    /**
     * As the fetch API is being used, when multipart/form-data is specified
     * the Content-Type header must be deleted so that the browser can set
     * the correct boundary.
     * https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects#sending_files_using_a_formdata_object
     */
    if (requestHeaders["Content-Type"].toLowerCase().includes("multipart/form-data")) {
      delete requestHeaders["Content-Type"];
    }

    const response = await window.fetch(\`\${baseUrl}\${resolveUrl(url, queryParams, pathParams)}\`,
      {
        signal,
        method: method.toUpperCase(),
        body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
        headers: requestHeaders
      }
    );
    if (!response.ok) {
      let error: ErrorWrapper<TError>;
      try {
        error = await response.json();
      } catch (e) {
        error = {
          status: "unknown" as const,
          payload:
            e instanceof Error
              ? \`Unexpected error (\${e.message})\`
              : "Unexpected error"
        };
      }

      throw error;
    }

    if (response.headers.get('content-type')?.includes('json')) {
      return await response.json();
    } else {
      // if it is not a json response, assume it is a blob and cast it to TData
      return (await response.blob()) as unknown as TData;
    }
  } catch (e) {
    let errorObject: Error = {
      name: "unknown" as const,
      message:
        e instanceof Error ? \`Network error (\${e.message})\` : "Network error",
      stack: e as string,
    };
    throw errorObject;
  }
}

const resolveUrl = (
  url: string,
  queryParams: Record<string, string> = {},
  pathParams: Record<string, string> = {}
) => {
  let query = new URLSearchParams(queryParams).toString();
  if (query) query = \`?\${query}\`;
  return url.replace(/\\{\\w*\\}/g, (key) => pathParams[key.slice(1, -1)]) + query;
};
`;
exports.getFetcher = getFetcher;
//# sourceMappingURL=fetcher.js.map