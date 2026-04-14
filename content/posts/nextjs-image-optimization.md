---
title: "Next.js 图片优化与性能优化实战"
description: "在数码配件商城项目中实现的图片加载优化策略，包括懒加载、压缩、响应式适配等关键技术。"
date: "2026-04-13"
tags:
  - "Next.js"
  - "性能优化"
  - "图片优化"
---

# Next.js 图片优化与性能优化实战

在开发数码配件商城时，图片加载性能对用户体验至关重要。本文总结了在 Next.js 项目中遇到的图片优化问题和解决方案。

## 1. Next.js Image 组件使用问题

### 问题描述
直接使用 `<img>` 标签导致图片加载缓慢，无法利用 Next.js 的图片优化功能。

### 解决方案

**使用 Next.js Image 组件：**
```typescript
import Image from 'next/image';

interface ProductCardProps {
  product: {
    id: number;
    title: string;
    price: number;
    mainImage: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="relative aspect-square">
        <Image
          src={product.mainImage}
          alt={product.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={false}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{product.title}</h3>
        <p className="text-lg font-bold text-primary">
          ¥{product.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
```

**配置 Next.js 图片域名：**
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wiptiezzfogvhvocdabo.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'your-cdn-domain.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

module.exports = nextConfig;
```

## 2. 图片懒加载与性能优化

### 问题描述
页面加载大量图片时，首屏渲染慢，用户体验差。

### 解决方案

**实现图片懒加载：**
```typescript
import Image from 'next/image';
import { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export function LazyImage({ src, alt, width, height, className }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
```

**使用 Intersection Observer 优化：**
```typescript
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface ObserverImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ObserverImage({ src, alt, width, height }: ObserverImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative">
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
        />
      ) : (
        <div
          style={{ width, height }}
          className="bg-gray-200 animate-pulse"
        />
      )}
    </div>
  );
}
```

## 3. 图片压缩与格式转换

### 问题描述
上传的图片文件过大，占用存储空间，加载速度慢。

### 解决方案

**后端图片压缩：**
```javascript
// src/middleware/upload.js
const sharp = require('sharp');

const compressImage = async (buffer, options = {}) => {
  const {
    width = 800,
    quality = 80,
    format = 'webp',
  } = options;

  let image = sharp(buffer);

  // 调整尺寸
  image = image.resize(width, null, {
    withoutEnlargement: true,
    fit: 'inside',
  });

  // 转换格式并压缩
  const formats = {
    webp: () => image.webp({ quality }),
    jpeg: () => image.jpeg({ quality }),
    png: () => image.png({ quality }),
  };

  return formats[format]().toBuffer();
};

const uploadToSupabase = async (file, folder = 'products') => {
  // 压缩图片
  const compressedBuffer = await compressImage(file.buffer, {
    width: 1200,
    quality: 85,
    format: 'webp',
  });

  const fileName = `${Date.now()}.webp`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, compressedBuffer, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (error) {
    throw new Error('文件上传失败');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath);

  return publicUrl;
};
```

**前端图片预览压缩：**
```typescript
// utils/image.ts
export const compressImage = (
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算新尺寸
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制并压缩
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => reject(new Error('图片加载失败'));
    img.src = URL.createObjectURL(file);
  });
};
```

## 4. 响应式图片与多尺寸适配

### 问题描述
不同设备屏幕尺寸下，图片显示效果不一致，加载不必要的图片资源。

### 解决方案

**使用 srcset 实现响应式图片：**
```typescript
import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
}

export function ResponsiveImage({ src, alt, sizes }: ResponsiveImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={
        sizes ||
        '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
      }
      quality={75}
      priority={false}
    />
  );
}
```

## 5. 图片缓存策略

### 问题描述
重复加载相同图片，浪费带宽，影响性能。

### 解决方案

**配置缓存头：**
```javascript
// 后端 Express 中间件
const cacheControl = (maxAge = 86400) => {
  return (req, res, next) => {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    next();
  };
};

// 应用到图片路由
app.use('/images', cacheControl(86400));
```

**Next.js 图片缓存配置：**
```typescript
// next.config.js
const nextConfig = {
  images: {
    minimumCacheTTL: 60, // 最小缓存时间（秒）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-cdn.com',
        pathname: '/**',
      },
    ],
  },
};
```

## 6. 图片加载错误处理

### 问题描述
图片加载失败时，页面出现破损图标，影响用户体验。

### 解决方案

**图片加载错误处理组件：**
```typescript
import { useState } from 'react';
import Image from 'next/image';

interface FallbackImageProps {
  src: string;
  alt: string;
  fallback?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function FallbackImage({
  src,
  alt,
  fallback = '/placeholder.png',
  width,
  height,
  className,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      className={className}
    />
  );
}
```

## 总结

Next.js 图片优化的关键点：

1. **使用 Image 组件**：充分利用 Next.js 的图片优化功能
2. **懒加载**：减少首屏加载时间
3. **图片压缩**：减小文件大小，提升加载速度
4. **响应式适配**：为不同设备提供合适的图片尺寸
5. **缓存策略**：减少重复请求，提升性能
6. **错误处理**：提供良好的降级体验
7. **性能监控**：持续优化和改进

通过以上优化策略，可以显著提升应用的图片加载性能和用户体验。