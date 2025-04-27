import axios, { AxiosRequestConfig } from 'axios';

export abstract class ClusterRestClient {
  constructor(
    protected baseUrl: string,
    protected cluster_security_key: string,
    protected cluster_service: string,
    protected timeout?: number,
  ) {}

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setClusterSecurityKey(cluster_sercurity_key: string) {
    this.cluster_security_key = cluster_sercurity_key;
  }

  setClusterService(service: string) {
    this.cluster_service = service;
  }

  setTimeout(timeout: number) {
    this.timeout = timeout;
  }

  protected async request<T>(
    path: string,
    config: AxiosRequestConfig,
  ): Promise<T> {
    const headers: Record<string, string> = {
      'X-Cluster-Security-Key': this.cluster_security_key,
      'X-Cluster-Service': this.cluster_service || 'UNKNOWN',
    };

    try {
      const response = await axios<T>({
        headers,
        timeout: this.timeout,
        url: `${this.baseUrl}${path}`,
        ...config,
      });
      return response.data;
    } catch (e) {
      const message =
        e.response?.data?.message ||
        e.response?.data?.error ||
        `HTTP: ${e.message}`;

      let res = String(e.response?.data || 'NO_DATA');
      if (res.includes('<html')) {
        res = res
          .replace(/(<([^>]+)>)/gi, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 1024);
      }
      throw new Error(message);
    }
  }
}
