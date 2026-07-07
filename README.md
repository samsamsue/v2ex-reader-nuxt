## ENV

### V2_COOKIE

V2EX cookie, used for authenticated list, notification, and reply requests.

### V2_USER_AGENT

Optional browser user-agent for V2EX requests.

### LINUXDO_COOKIE

linux.do cookie, used for authenticated linux.do list, notification, topic, and reply requests.

### LINUXDO_CF_CLEARANCE

Optional Cloudflare clearance token for linux.do requests.

### LINUXDO_USER_AGENT

Optional browser user-agent for linux.do requests. Use the same user-agent that produced `LINUXDO_COOKIE` / `LINUXDO_CF_CLEARANCE`.

### LINUXDO_PROXY_URL

Optional proxy URL used only for linux.do requests. This takes priority over `HTTPS_PROXY`, `https_proxy`, `HTTP_PROXY`, `http_proxy`, `ALL_PROXY`, and `all_proxy`.

### LINUXDO_RSS_NO_PROXY

Set to `1` only when the Nuxt server can reach linux.do without `LINUXDO_PROXY_URL` / `HTTPS_PROXY` / `HTTP_PROXY`. By default linux.do RSS requests use the configured proxy. Lowercase proxy env names such as `https_proxy` are also supported.

### LINUXDO_RSS_WITH_COOKIE

Set to `1` to send `LINUXDO_COOKIE` / `LINUXDO_CF_CLEARANCE` with linux.do RSS requests. This can help when your browser can read RSS through the same proxy because it already has a valid linux.do session.

### LINUXDO_RSS_CURL_FALLBACK

linux.do RSS requests automatically retry with `curl` when Node fetch fails. Set to `0` to disable this fallback.

### LINUXDO_CURL_BIN

Optional curl executable path. Defaults to `curl`.

### LINUXDO_BASE_URL

Optional linux.do base URL override.

### PASSWORD

Optional access password for this reader. When unset, the app is open.
