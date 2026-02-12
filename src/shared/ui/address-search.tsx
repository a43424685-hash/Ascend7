'use client'

import { useEffect, useCallback } from 'react'
import { Button } from './button'

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeResult) => void
        width?: string
        height?: string
      }) => { open: () => void }
    }
  }
}

interface DaumPostcodeResult {
  zonecode: string      // 우편번호
  roadAddress: string   // 도로명주소
  jibunAddress: string  // 지번주소
  buildingName: string  // 건물명
  apartment: string     // 아파트 여부 (Y/N)
}

interface AddressSearchProps {
  onComplete: (result: { postalCode: string; address: string }) => void
  buttonText?: string
  buttonSize?: 'sm' | 'md' | 'lg'
}

export function AddressSearch({
  onComplete,
  buttonText = '주소 검색',
  buttonSize = 'sm',
}: AddressSearchProps) {
  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (window.daum?.Postcode) return

    const script = document.createElement('script')
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // cleanup은 하지 않음 (다른 컴포넌트에서도 사용할 수 있으므로)
    }
  }, [])

  const handleSearch = useCallback(() => {
    if (!window.daum?.Postcode) {
      alert('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeResult) => {
        const address = data.buildingName
          ? `${data.roadAddress} (${data.buildingName})`
          : data.roadAddress

        onComplete({
          postalCode: data.zonecode,
          address,
        })
      },
    }).open()
  }, [onComplete])

  return (
    <Button
      type="button"
      variant="outline"
      size={buttonSize}
      onClick={handleSearch}
    >
      {buttonText}
    </Button>
  )
}
