import { File } from './file.model';
import { Process } from './process.model';

export interface ApiStartResponse {
  status: number;
  message: string;
  processid: number;
}

export interface ApiMeta {
  current_page: number,
  per_page: number,
  total_count: number,
  total_pages: number
}

export interface ApiProcessesResponse {
  _meta: ApiMeta,
  result: Process[]
}

export interface ApiInputResponse extends Array<File> { }
export interface ApiDropboxResponse extends Array<File> { }
