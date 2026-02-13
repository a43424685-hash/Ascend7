export type BrandValue = { num: string; title: string; desc: string }
export type PhilosophyStat = { num: string; label: string }
export type PhilosophyData = {
  subheading: string
  heading: string
  headingHighlight: string
  description: string
  buttonText: string
  buttonUrl: string
  stats: PhilosophyStat[]
}
export type BottomCtaData = {
  subheading: string
  heading: string
  description: string
  buttonText: string
  buttonUrl: string
}

export const HOME_DEFAULTS = {
  brand_values: [
    { num: '01', title: 'PERFORMANCE', desc: '고성능 원단' },
    { num: '02', title: 'DURABILITY', desc: '뛰어난 내구성' },
    { num: '03', title: 'COMFORT', desc: '극한의 편안함' },
    { num: '04', title: 'STYLE', desc: '프리미엄 디자인' },
  ] as BrandValue[],
  philosophy: {
    subheading: 'Our Philosophy',
    heading: 'PUSH YOUR',
    headingHighlight: 'LIMITS',
    description: 'ASCEND7은 최고의 퍼포먼스를 추구하는 이들을 위해 탄생했습니다.\n모든 제품은 훈련의 한계를 넘어설 수 있도록 설계되었습니다.',
    buttonText: 'EXPLORE',
    buttonUrl: '/shop',
    stats: [
      { num: '100%', label: '프리미엄 원단' },
      { num: '7일', label: '무료 교환/반품' },
      { num: '5만원+', label: '무료 배송' },
      { num: '1:1', label: '카카오 상담' },
    ],
  } as PhilosophyData,
  bottom_cta: {
    subheading: 'Ready to Level Up?',
    heading: 'START YOUR JOURNEY',
    description: '지금 ASCEND7 컬렉션을 만나보세요.',
    buttonText: 'SHOP ALL',
    buttonUrl: '/shop',
  } as BottomCtaData,
}
