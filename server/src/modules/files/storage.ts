export interface StoredFileInput {
  key: string;
  contentType: string;
  body: Buffer;
}

export interface StoredFile {
  body: Buffer;
  contentType: string;
}

export interface FileStorage {
  put(input: StoredFileInput): Promise<void>;
  get(key: string): Promise<StoredFile>;
  remove(key: string): Promise<void>;
}
