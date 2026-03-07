'use client'

import { useState, useEffect } from 'react'

interface ModernLoaderProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
  variant?: 'dots' | 'pulse' | 'shimmer' | 'gradient'
}

export function ModernLoader({
  message = 'Loading...',
  size = 'medium',
  variant = 'gradient',
}: ModernLoaderProps) {
  const [displayText, setDisplayText] = useState(message)

  useEffect(() => {
    if (!message.includes('...')) {
      let dots = ''
      const interval = setInterval(() => {
        dots = dots.length < 3 ? dots + '.' : ''
        setDisplayText(message + dots)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [message])

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  }

  const containerSize = {
    small: 'h-screen flex items-center justify-center',
    medium: 'h-screen flex items-center justify-center',
    large: 'h-screen flex items-center justify-center',
  }

  return (
    <div className={`bg-background flex flex-col items-center justify-center gap-6 ${containerSize[size]}`}>
      {/* Gradient Spinner */}
      {variant === 'gradient' && (
        <div className={`relative ${sizeClasses[size]}`}>
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary animate-spin"
            style={{
              backgroundSize: '200% 200%',
              animation: 'gradient-spin 3s linear infinite',
            }}
          />
          <div className="absolute inset-1 rounded-full bg-background" />

          <style jsx>{`
            @keyframes gradient-spin {
              0% {
                background-position: 0% 50%;
                transform: rotate(0deg);
              }
              50% {
                background-position: 100% 50%;
              }
              100% {
                background-position: 0% 50%;
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}

      {/* Dots Loader */}
      {variant === 'dots' && (
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full bg-primary"
              style={{
                width: size === 'small' ? '8px' : size === 'medium' ? '12px' : '16px',
                height: size === 'small' ? '8px' : size === 'medium' ? '12px' : '16px',
                animation: `bounce 1.4s infinite ease-in-out`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
          <style jsx>{`
            @keyframes bounce {
              0%,
              80%,
              100% {
                transform: scale(0);
              }
              40% {
                transform: scale(1);
              }
            }
          `}</style>
        </div>
      )}

      {/* Pulse Loader */}
      {variant === 'pulse' && (
        <div className="relative">
          <div
            className={`${sizeClasses[size]} rounded-full bg-primary animate-pulse`}
            style={{
              animation: 'pulse-ring 2s infinite ease-out',
            }}
          />
          <div
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-primary`}
            style={{
              animation: 'pulse-ring 2s infinite ease-out',
              animationDelay: '0.5s',
              opacity: 0.5,
            }}
          />
          <style jsx>{`
            @keyframes pulse-ring {
              0% {
                transform: scale(0.8);
                opacity: 1;
              }
              100% {
                transform: scale(2);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* Shimmer Loader */}
      {variant === 'shimmer' && (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
          <div
            className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{
              animation: 'shimmer 2s infinite',
              backgroundSize: '200% 100%',
            }}
          />
          <style jsx>{`
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
          `}</style>
        </div>
      )}

      {/* Loading Text */}
      <p className="text-foreground text-sm font-medium tracking-wide">
        {displayText}
      </p>

      {/* Progress Bar */}
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          style={{
            animation: 'progress 2s ease-in-out infinite',
            width: '30%',
          }}
        />
        <style jsx>{`
          @keyframes progress {
            0% {
              width: 10%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 10%;
            }
          }
        `}</style>
      </div>
    </div>
  )
}
