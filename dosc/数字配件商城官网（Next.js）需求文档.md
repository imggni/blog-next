# 数字配件商城官网（Next.js）需求文档
**文档版本**：V1.0
**适用项目**：基于 OpenAPI 3.0 数字配件商城 API 的 Next.js 商城官网
**技术栈**：Next.js 14+、TypeScript、Tailwind CSS、Axios、状态管理（Zustand/Redux）

---

## 一、文档概述
### 1.1 项目背景
基于提供的 **Digital Accessories Mall API** 接口规范，使用 Next.js 开发一套完整的数字配件线上商城，实现用户端购物 + 管理员后台管理一体化官网。

### 1.2 文档目标
- 明确前端页面、功能、交互、接口对接规范
- 作为开发、联调、测试、验收的唯一依据
- 保证前后端数据结构、字段、权限完全对齐

### 1.3 接口基础信息
- 基础请求地址：`http://localhost:3000/api`
- 认证方式：JWT Bearer Token
- 统一返回结构：`code + message + data`

---

## 二、用户角色与权限
| 角色 | 权限范围 |
|------|----------|
| 游客 | 浏览首页、分类、商品列表、商品详情 |
| 普通用户 | 注册/登录、个人信息、地址、订单、收藏、下单 |
| 管理员 | 分类管理、商品管理、订单状态修改 |

---

## 三、功能模块需求
### 3.1 健康检查模块
- 页面加载时自动请求 `/health`
- 用于前端监控服务可用性，异常时给出提示

### 3.2 用户模块
#### 3.2.1 用户注册
- 接口：`POST /user/register`
- 必传：`phone`、`code`
- 可选：`username`
- 注册成功自动登录并跳转首页

#### 3.2.2 手机号验证码登录
- 接口：`POST /user/login/phone`
- 必传：`phone`、`code`
- 登录成功保存 `token` 到全局状态与持久化存储

#### 3.2.3 获取个人信息
- 接口：`GET /user/info`
- 需要 Token
- 展示：用户名、手机号、头像、创建时间、是否管理员

#### 3.2.4 修改个人信息
- 接口：`PUT /user/info`
- 可修改：`username`、`avatar`

#### 3.2.5 上传头像
- 接口：`POST /user/avatar`
- 格式：`multipart/form-data`
- 文件：`avatar`（binary）

### 3.3 商品分类模块
#### 3.3.1 获取分类列表
- 接口：`GET /category`
- 无需权限
- 按 `sort` 升序展示

#### 3.3.2 分类管理（管理员）
- 创建：`POST /category`
- 修改：`PUT /category/{id}`
- 删除：`DELETE /category/{id}`
- 字段：`name`（必传）、`icon`、`sort`

### 3.4 商品模块
#### 3.4.1 商品列表
- 接口：`GET /product`
- 支持筛选：
  - `categoryId` 分类筛选
  - `keyword` 标题模糊搜索
  - `isHot` 爆款
  - `isNew` 新品
  - `all` 是否显示下架（仅管理员）
- 商品卡片展示：主图、标题、售价、原价、销量、标签

#### 3.4.2 商品详情
- 接口：`GET /product/{id}`
- 展示：标题、价格、库存、规格、主图、详情图、描述、状态标签
- 操作：加入收藏、选择规格、下单

#### 3.4.3 商品管理（管理员）
- 创建：`POST /product`
- 修改：`PUT /product/{id}`
- 删除：`DELETE /product/{id}`
- 必传字段：`title`、`categoryId`、`price`、`mainImage`

### 3.5 收货地址模块
#### 3.5.1 地址列表
- 接口：`GET /address`
- 需要 Token
- 展示默认地址标记

#### 3.5.2 地址操作
- 新增：`POST /address`
- 修改：`PUT /address/{id}`
- 删除：`DELETE /address/{id}`
- 设置默认：`PUT /address/{id}/default`
- 必传：收货人、电话、省、市、区、详细地址

### 3.6 订单模块
#### 3.6.1 创建订单
- 接口：`POST /order`
- 需要 Token
- 必传：`addressId`、`payType`、`items`
- `items` 包含：`productId`、`quantity`、`specs`（可选）

#### 3.6.2 订单列表 & 详情
- 列表：`GET /order`
- 详情：`GET /order/{id}`
- 展示：订单号、金额、状态、地址、商品清单、时间

#### 3.6.3 订单操作
- 取消未支付订单：`POST /order/{id}/cancel`
- 修改订单状态（管理员）：`PUT /order/{id}/status`
  - 可改：`orderStatus`、`payStatus`、`logisticsNo`

### 3.7 收藏模块
#### 3.7.1 收藏列表
- 接口：`GET /collection`
- 需要 Token

#### 3.7.2 收藏操作
- 添加收藏：`POST /collection`（传 `productId`）
- 取消收藏：`DELETE /collection/{productId}`

---

## 四、页面结构与路由（Next.js）
| 页面路径 | 页面名称 | 权限 | 核心接口 |
|----------|----------|------|----------|
| `/` | 首页 | 全部 | `/category`、`/product` |
| `/login` | 登录 | 游客 | `/user/login/phone` |
| `/register` | 注册 | 游客 | `/user/register` |
| `/profile` | 个人中心 | 登录 | `/user/info` |
| `/product` | 商品列表 | 全部 | `/product` |
| `/product/[id]` | 商品详情 | 全部 | `/product/{id}` |
| `/address` | 地址管理 | 登录 | `/address` |
| `/order` | 订单列表 | 登录 | `/order` |
| `/order/[id]` | 订单详情 | 登录 | `/order/{id}` |
| `/collection` | 我的收藏 | 登录 | `/collection` |
| `/admin/category` | 分类管理 | 管理员 | `/category` |
| `/admin/product` | 商品管理 | 管理员 | `/product` |
| `/admin/order` | 订单管理 | 管理员 | `/order` |

---

## 五、接口对接规范
### 5.1 请求头
- 普通 JSON：`Content-Type: application/json`
- 身份验证：`Authorization: Bearer {token}`
- 上传头像：`Content-Type: multipart/form-data`

### 5.2 响应处理
所有接口统一返回：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}