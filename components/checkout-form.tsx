/**
 * @file checkout-form.tsx
 * @description 주문 폼 컴포넌트
 *
 * 주문 페이지에서 배송지 정보와 주문 메모를 입력받는 폼 컴포넌트입니다.
 * react-hook-form과 zod를 사용한 폼 유효성 검사를 포함합니다.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { CartItem } from "@/types/cart";
import type { CreateOrderInput } from "@/types/order";
import { createOrder } from "@/actions/order";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

/**
 * 주문 폼 스키마 (zod)
 */
const checkoutFormSchema = z.object({
  recipient_name: z.string().min(1, "수령인 이름을 입력해주세요."),
  recipient_phone: z
    .string()
    .min(1, "전화번호를 입력해주세요.")
    .regex(/^[0-9-]+$/, "전화번호는 숫자와 하이픈만 입력 가능합니다."),
  postal_code: z.string().min(1, "우편번호를 입력해주세요."),
  address: z.string().min(1, "주소를 입력해주세요."),
  detail_address: z.string().optional(),
  order_note: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutFormProps {
  cartItems: CartItem[];
  totalAmount: number;
}

/**
 * 주문 폼 컴포넌트
 * @param cartItems - 장바구니 아이템 목록
 * @param totalAmount - 총 주문 금액
 */
export function CheckoutForm({ cartItems, totalAmount }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      recipient_name: "",
      recipient_phone: "",
      postal_code: "",
      address: "",
      detail_address: "",
      order_note: "",
    },
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    console.group("[CheckoutForm] 주문 폼 제출");
    console.log("폼 데이터:", data);

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // CreateOrderInput 형식으로 변환
      const orderInput: CreateOrderInput = {
        shipping_address: {
          recipient_name: data.recipient_name,
          recipient_phone: data.recipient_phone,
          postal_code: data.postal_code,
          address: data.address,
          detail_address: data.detail_address,
        },
        order_note: data.order_note || undefined,
      };

      console.log("[CheckoutForm] 주문 생성 요청:", orderInput);

      const result = await createOrder(orderInput);

      if (result.success) {
        console.log("[CheckoutForm] 주문 생성 성공, 주문 ID:", result.orderId);
        // Phase 4에서 결제 페이지로 리다이렉트 예정
        // 현재는 주문 완료 메시지 표시 후 장바구니로 이동
        router.push(`/cart?orderSuccess=${result.orderId}`);
      } else {
        console.error("[CheckoutForm] 주문 생성 실패:", result.message);
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("[CheckoutForm] 주문 생성 에러:", error);
      setErrorMessage("주문 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
      console.groupEnd();
    }
  };

  return (
    <div className="space-y-6">
      {/* 장바구니 아이템 요약 */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">주문 상품</h2>
        <div className="space-y-3">
          {cartItems.map((item) => {
            const subtotal = item.product.price * item.quantity;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(item.product.price)} × {item.quantity}개
                  </p>
                </div>
                <p className="font-semibold">{formatPrice(subtotal)}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <span className="text-lg font-semibold">총 금액</span>
          <span className="text-2xl font-bold text-primary">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>

      {/* 주문 폼 */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 배송지 정보 섹션 */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">배송지 정보</h2>

            {/* 수령인 이름 */}
            <FormField
              control={form.control}
              name="recipient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수령인 이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 수령인 전화번호 */}
            <FormField
              control={form.control}
              name="recipient_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>전화번호 *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="010-1234-5678"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 우편번호 */}
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>우편번호 *</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 주소 */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소 *</FormLabel>
                  <FormControl>
                    <Input placeholder="서울시 강남구 테헤란로 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 상세주소 */}
            <FormField
              control={form.control}
              name="detail_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세주소</FormLabel>
                  <FormControl>
                    <Input placeholder="123호 (선택사항)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 주문 메모 섹션 */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">주문 메모</h2>
            <FormField
              control={form.control}
              name="order_note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>배송 시 요청사항 (선택사항)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="배송 시 요청사항을 입력해주세요."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4">
            <Link href="/cart" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "주문 처리 중..." : "주문하기"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

