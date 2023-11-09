# not-sensitively-refreshed-Token
自用无感知刷新 token 方案

最近遇到一个项目涉及大量表单项的填写，用户往往需要花相当长的时间填完且长时间停留在表单页，这时候提交有概率 token 失效了。

之前逻辑是统一跳转到登录页，但是这种场景下还是考虑用 `token 无感知刷新` 方案来解决这个问题会比较好。

### 思路
使用两个 token:

- accessToken：普通 token，时效短 作为真正令牌
- refreshToken：刷新 token，时效长 作为获取令牌的认证

accessToken 用来充当接口请求的令牌，当 accessToken 过期时效的时候，会使用 refreshToken 去请求后端，重新获取一个有效的 accessToken，然后让接口重新发起请求，从而达到用户无感知 token 刷新的效果

具体分为几步：
1. 登录时，拿到 accessToken 和 refreshToken，并存起来
2. 请求接口时，带着 accessToken 去请求
3. 如果 accessToken 过期失效了，后端会返回 401
4. 401 时，前端会使用 refreshToken 去请求后端再给一个有效的 accessToken
5. 重新拿到有效的 accessToken 后，将刚刚的请求重新发起
6. 重复1/2/3/4/5

### 配置项

- baseUrl：基础 url
- url：请求新 accessToken 的 url
- getRefreshToken：获取 refreshToken 的函数
- unauthorizedCode：无权限的状态码，默认 401
- onSuccess：获取新 accessToken 成功后的回调
- onError：获取新 accessToken 失败后的回调