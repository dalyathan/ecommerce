export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type Invoice = {
  __typename?: 'Invoice';
  createdAt?: Maybe<Scalars['DateTime']>;
  customerEmail: Scalars['String'];
  downloadUrl: Scalars['String'];
  id: Scalars['ID'];
  invoiceNumber: Scalars['Int'];
  orderCode: Scalars['String'];
  orderId: Scalars['String'];
};

export type InvoiceConfig = {
  __typename?: 'InvoiceConfig';
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  templateString?: Maybe<Scalars['String']>;
};

export type InvoiceConfigInput = {
  enabled: Scalars['Boolean'];
  templateString?: InputMaybe<Scalars['String']>;
};

export type InvoiceList = {
  __typename?: 'InvoiceList';
  items: Array<Invoice>;
  totalItems: Scalars['Int'];
};

export type InvoicesListInput = {
  itemsPerPage: Scalars['Int'];
  page: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  upsertInvoiceConfig: InvoiceConfig;
};


export type MutationUpsertInvoiceConfigArgs = {
  input?: InputMaybe<InvoiceConfigInput>;
};

export type Query = {
  __typename?: 'Query';
  invoiceConfig?: Maybe<InvoiceConfig>;
  /** Get paginated invoices */
  invoices: InvoiceList;
};


export type QueryInvoicesArgs = {
  input?: InputMaybe<InvoicesListInput>;
};

export type UpsertInvoiceConfigMutationVariables = Exact<{
  input: InvoiceConfigInput;
}>;


export type UpsertInvoiceConfigMutation = { __typename?: 'Mutation', upsertInvoiceConfig: { __typename?: 'InvoiceConfig', id: string, enabled: boolean, templateString?: string | null } };

export type InvoiceConfigQueryVariables = Exact<{ [key: string]: never; }>;


export type InvoiceConfigQuery = { __typename?: 'Query', invoiceConfig?: { __typename?: 'InvoiceConfig', id: string, enabled: boolean, templateString?: string | null } | null };

export type InvoicesQueryVariables = Exact<{
  input?: InputMaybe<InvoicesListInput>;
}>;


export type InvoicesQuery = { __typename?: 'Query', invoices: { __typename?: 'InvoiceList', totalItems: number, items: Array<{ __typename?: 'Invoice', id: string, createdAt?: any | null, orderCode: string, orderId: string, customerEmail: string, invoiceNumber: number, downloadUrl: string }> } };
