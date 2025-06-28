import React, { useState } from 'react';
import { 
  Coffee, Plus, Minus, TrendingUp, Calendar, Award, Zap, Milk, Edit2, Check, X, Settings, Tag, Save,
  // 음식 & 음료
  Wine, Beer, Apple,
  // 건강 & 피트니스
  Activity, Heart, Shield, 
  // 일상 & 활동
  Book, Briefcase, Car, Clock, Home, Key, Phone, Tv, Music, Camera, Headphones,
  // 자연 & 날씨
  Sun, Moon, Cloud, Star, Leaf, Mountain,
  // 도구 & 오브젝트
  Wrench, Scissors, Pen, Calculator, Laptop, Mouse, Keyboard, Monitor,
  // 여행 & 교통
  MapPin, Compass, Fuel, Navigation,
  // 스포츠 & 게임
  Target, Trophy, 
  // 쇼핑 & 돈
  ShoppingCart, CreditCard, DollarSign, Gift, ShoppingBag, Package,
  // 소셜 & 커뮤니케이션
  MessageCircle, Mail, Users, UserPlus, Share, Smile,
  // 시간 & 알림
  Timer, Bell, Watch,
  // 학습 & 교육
  GraduationCap, BookOpen, Pencil, Globe, 
  // 엔터테인먼트
  Film, Video, Play, Pause, Volume2, Radio,
  // 건축 & 공간
  Building, Building2, 
  // 동물
  Bird,
  // 식물
  Flower, Flower2,
  // 의류 & 액세서리
  Glasses, Crown, 
  // 기타
  Zap as Lightning, Flame as Fire, Droplets, Snowflake, Sparkles, Lock, Unlock, Flag, Bookmark, Gem,
  // 언어 선택
  Languages,
  // 후원 관련 (Coffee를 CoffeeIcon으로 별칭 사용)
  Coffee as CoffeeIcon
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Language, languageNames } from '../locales';

// 타입 정의
interface CategoryData {
  count: number;
  amounts: number[];
}

interface DonationOption {
  id: string;
  amount: number;
  currency: string;
  label: string;
  description: string;
}

interface Category {
  name: string;
  icon: string;
  color: string;
  unit: string;
  defaultAmount: number;
  labels: {
    single: string;
    plural: string;
  };
}

interface Categories {
  [key: string]: Category;
}

interface Data {
  [categoryId: string]: {
    [date: string]: CategoryData;
  };
}

const FlexibleCounter: React.FC = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  
  const today = new Date().toISOString().split('T')[0];
  
  const [data, setData] = useState<Data>({});
  const [categories, setCategories] = useState<Categories>({
    coffee: { 
      name: t('categories.coffee'), 
      icon: 'Coffee', 
      color: 'amber', 
      unit: 'ml', 
      defaultAmount: 250,
      labels: { single: t('units.single'), plural: t('units.plural') }
    },
    protein: { 
      name: t('categories.protein'), 
      icon: 'Zap', 
      color: 'blue', 
      unit: 'g', 
      defaultAmount: 30,
      labels: { single: t('units.scoop'), plural: t('units.scoop') }
    },
    milk: { 
      name: t('categories.milk'), 
      icon: 'Milk', 
      color: 'indigo', 
      unit: 'ml', 
      defaultAmount: 200,
      labels: { single: t('units.cup'), plural: t('units.cup') }
    }
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('coffee');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [showDonationModal, setShowDonationModal] = useState<boolean>(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationOption | null>(null);
  const [newCategory, setNewCategory] = useState<Category & { id: string }>({
    id: '',
    name: '',
    icon: 'Coffee',
    color: 'blue',
    unit: 'ml',
    defaultAmount: 100,
    labels: { single: t('units.piece'), plural: t('units.piece') }
  });


  // 색상 옵션
  const colorOptions = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 
    'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 
    'violet', 'purple', 'fuchsia', 'pink', 'rose'
  ];

  const currentData = data[activeTab] || {};
  const todayData = currentData[today] || { count: 0, amounts: [] };
  const todayCount = todayData.count;

  // 아이콘 맵핑 (카테고리별로 정리)
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    // 음식 & 음료
    Coffee, Apple, Beer, Wine, Milk,
    // 건강 & 피트니스  
    Activity, Heart, Shield, Zap,
    // 일상 & 활동
    Book, Briefcase, Car, Clock, Home, Key, Phone, Tv, Music, Camera, Headphones,
    // 자연 & 날씨
    Sun, Moon, Cloud, Star, Leaf, Mountain,
    // 도구 & 오브젝트
    Wrench, Scissors, Pen, Calculator, Laptop, Mouse, Keyboard, Monitor,
    // 여행 & 교통
    MapPin, Compass, Fuel, Navigation,
    // 스포츠 & 게임
    Target, Trophy,
    // 쇼핑 & 돈
    ShoppingCart, CreditCard, DollarSign, Gift, ShoppingBag, Package,
    // 소셜 & 커뮤니케이션
    MessageCircle, Mail, Users, UserPlus, Share, Smile,
    // 시간 & 알림
    Timer, Bell, Watch,
    // 학습 & 교육
    GraduationCap, BookOpen, Pencil, Globe,
    // 엔터테인먼트
    Film, Video, Play, Pause, Volume2, Radio,
    // 건축 & 공간
    Building, Building2,
    // 동물
    Bird,
    // 식물
    Flower, Flower2,
    // 의류 & 액세서리
    Glasses, Crown,
    // 기타
    Lightning, Fire, Droplets, Snowflake, Sparkles, Gem, Lock, Unlock, Flag, Bookmark,
    // 시스템
    Settings, Calendar, Award, TrendingUp, Tag, Save, Edit2, Check, X, Plus, Minus
  };

  // 아이콘 카테고리 (선택기에서 사용)
  const iconCategories: { [key: string]: string[] } = {
    [t('iconCategories.food')]: ['Coffee', 'Apple', 'Beer', 'Wine', 'Milk'],
    [t('iconCategories.health')]: ['Activity', 'Heart', 'Shield', 'Zap'],
    [t('iconCategories.daily')]: ['Book', 'Briefcase', 'Car', 'Clock', 'Home', 'Key', 'Phone', 'Tv', 'Music', 'Camera', 'Headphones'],
    [t('iconCategories.nature')]: ['Sun', 'Moon', 'Cloud', 'Star', 'Leaf', 'Mountain'],
    [t('iconCategories.tools')]: ['Wrench', 'Scissors', 'Pen', 'Calculator', 'Laptop', 'Mouse', 'Keyboard', 'Monitor'],
    [t('iconCategories.travel')]: ['MapPin', 'Compass', 'Fuel', 'Navigation'],
    [t('iconCategories.sports')]: ['Target', 'Trophy'],
    [t('iconCategories.shopping')]: ['ShoppingCart', 'CreditCard', 'DollarSign', 'Gift', 'ShoppingBag', 'Package'],
    [t('iconCategories.social')]: ['MessageCircle', 'Mail', 'Users', 'UserPlus', 'Share', 'Smile'],
    [t('iconCategories.time')]: ['Timer', 'Bell', 'Watch'],
    [t('iconCategories.education')]: ['GraduationCap', 'BookOpen', 'Pencil', 'Globe'],
    [t('iconCategories.entertainment')]: ['Film', 'Video', 'Play', 'Pause', 'Volume2', 'Radio'],
    [t('iconCategories.architecture')]: ['Building', 'Building2'],
    [t('iconCategories.animals')]: ['Bird'],
    [t('iconCategories.plants')]: ['Flower', 'Flower2'],
    [t('iconCategories.fashion')]: ['Glasses', 'Crown'],
    [t('iconCategories.misc')]: ['Lightning', 'Fire', 'Droplets', 'Snowflake', 'Sparkles', 'Gem', 'Lock', 'Unlock', 'Flag', 'Bookmark']
  };

  // 첫 기록일부터 오늘까지의 날짜 배열 생성
  const generateDates = () => {
    const dates = [];
    const dataKeys = Object.keys(currentData);
    
    if (dataKeys.length === 0) {
      return [today];
    }
    
    const earliestDate = new Date(Math.min(...dataKeys.map(date => new Date(date).getTime())));
    const endDate = new Date();
    
    for (let d = new Date(earliestDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d).toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const dates = generateDates();

  // 아이템 추가
  const addItem = (categoryId: string) => {
    const category = categories[categoryId];
    const amount = category.defaultAmount;
    const currentItem = data[categoryId]?.[today] || { count: 0, amounts: [] };
    const newCount = currentItem.count + 1;
    const newAmounts = [...currentItem.amounts, amount];
    
    setData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [today]: {
          count: newCount,
          amounts: newAmounts
        }
      }
    }));
  };

  // 아이템 제거
  const removeItem = (categoryId: string) => {
    const currentItem = data[categoryId]?.[today];
    if (currentItem && currentItem.count > 0) {
      const newCount = currentItem.count - 1;
      const newAmounts = currentItem.amounts.slice(0, -1);
      
      if (newCount === 0) {
        const newData = { ...data[categoryId] };
        delete newData[today];
        setData(prev => ({
          ...prev,
          [categoryId]: newData
        }));
      } else {
        setData(prev => ({
          ...prev,
          [categoryId]: {
            ...prev[categoryId],
            [today]: {
              count: newCount,
              amounts: newAmounts
            }
          }
        }));
      }
    }
  };

  // 양 수정
  const updateAmount = (categoryId: string, index: number, newValue: string) => {
    const value = parseFloat(newValue);
    if (isNaN(value) || value <= 0) return;

    const currentItem = data[categoryId]?.[today];
    if (currentItem) {
      const newAmounts = [...currentItem.amounts];
      newAmounts[index] = value;
      
      setData(prev => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          [today]: {
            ...currentItem,
            amounts: newAmounts
          }
        }
      }));
    }
    setEditingIndex(null);
  };

  // 카테고리 추가
  const addCategory = () => {
    if (!newCategory.id || !newCategory.name || categories[newCategory.id]) {
      alert(t('messages.invalidCategoryInfo'));
      return;
    }

    setCategories(prev => ({
      ...prev,
      [newCategory.id]: { ...newCategory }
    }));

    setData(prev => ({
      ...prev,
      [newCategory.id]: {}
    }));

    setNewCategory({
      id: '',
      name: '',
      icon: 'Coffee',
      color: 'blue',
      unit: 'ml',
      defaultAmount: 100,
      labels: { single: t('units.piece'), plural: t('units.piece') }
    });
  };

  // 카테고리 삭제
  const deleteCategory = (categoryId: string) => {
    if (Object.keys(categories).length <= 1) {
      alert(t('messages.minimumCategoryRequired'));
      return;
    }

    if (window.confirm(`${t('messages.confirmDeleteCategory').replace('category', `"${categories[categoryId].name}"`)} ${t('messages.confirmDeleteCategory')}`)) {
      const newCategories = { ...categories };
      delete newCategories[categoryId];
      setCategories(newCategories);

      const newData = { ...data };
      delete newData[categoryId];
      setData(newData);

      // 활성 탭이 삭제된 경우 첫 번째 카테고리로 이동
      if (activeTab === categoryId) {
        setActiveTab(Object.keys(newCategories)[0]);
      }
    }
  };

  // 카테고리 업데이트
  const updateCategory = (categoryId: string, updates: Partial<Category>) => {
    setCategories(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        ...updates
      }
    }));
  };



  // 후원 옵션 (모든 통화를 달러로 통일)
  const donationOptions: DonationOption[] = [
    {
      id: 'tip',
      amount: 1,
      currency: 'USD',
      label: t('donation.tip'),
      description: t('donation.amounts.tip')
    },
    {
      id: 'coffee',
      amount: 3,
      currency: 'USD',
      label: t('donation.coffee'),
      description: t('donation.amounts.coffee')
    },
    {
      id: 'snack',
      amount: 5,
      currency: 'USD',
      label: t('donation.snack'),
      description: t('donation.amounts.snack')
    },
    {
      id: 'meal',
      amount: 7,
      currency: 'USD',
      label: t('donation.meal'),
      description: t('donation.amounts.meal')
    },
    {
      id: 'premium',
      amount: 10,
      currency: 'USD',
      label: t('donation.premium'),
      description: t('donation.amounts.premium')
    }
  ];

  // 후원 처리
  const processDonation = (option: DonationOption) => {
    // 실제 결제 처리는 여기서 구현 (Stripe, PayPal 등)
    alert(`${t('donation.thankYou')}\n${option.description}`);
    setShowDonationModal(false);
    setSelectedDonation(null);
  };

  // 후원 금액 포맷팅 (달러 전용)
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // 후원 모달
  const DonationModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-lg w-full rounded-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-600 text-center">
            <div className="flex items-center justify-between">
              <div></div>
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500" />
                <h3 className="text-xl font-semibold">{t('donation.title')}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm opacity-75 mt-2">{t('donation.description')}</p>
          </div>
          
          {/* 내용 */}
          <div className="p-6">
            <h4 className="text-lg font-medium mb-4">{t('donation.selectAmount')}</h4>
            
            {/* 후원 옵션들 */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              {donationOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedDonation(option)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedDonation?.id === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {option.id === 'tip' && <DollarSign className="w-5 h-5 text-green-500" />}
                      {option.id === 'coffee' && <CoffeeIcon className="w-5 h-5 text-amber-500" />}
                      {option.id === 'snack' && <Apple className="w-5 h-5 text-red-500" />}
                      {option.id === 'meal' && <Gift className="w-5 h-5 text-blue-500" />}
                      {option.id === 'premium' && <Sparkles className="w-5 h-5 text-purple-500" />}
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm opacity-75">{option.description}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-500">
                      {formatAmount(option.amount, option.currency)}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* 결제 방법 */}
            {selectedDonation && (
              <div className="mb-6">
                <h5 className="font-medium mb-3">{t('donation.paymentMethods')}</h5>
                <div className="grid grid-cols-2 gap-2">
                  <button className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${
                    isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}>
                    <CreditCard className="w-4 h-4" />
                    <span className="text-sm">{t('donation.creditCard')}</span>
                  </button>
                  <button className={`p-3 rounded-lg border flex items-center justify-center gap-2 ${
                    isDarkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{t('donation.paypal')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {t('buttons.cancel')}
              </button>
              <button
                onClick={() => selectedDonation && processDonation(selectedDonation)}
                disabled={!selectedDonation}
                className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  selectedDonation
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-400 cursor-not-allowed text-gray-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                {t('buttons.donate')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };



  // 색상 결정
  const getItemColor = (color: string, count: number) => {
    if (!count) return isDarkMode ? 'bg-gray-800' : 'bg-gray-200';
    
    const intensity = Math.min(count, 5);
    const levels = ['300', '500', '600', '700', '900'];
    return `bg-${color}-${levels[intensity - 1]}`;
  };

  // 통계 계산
  const calculateStats = (categoryId: string) => {
    const categoryData = data[categoryId] || {};
    const total = Object.values(categoryData).reduce((sum, item) => sum + (item.count || 0), 0);
    const totalAmount = Object.values(categoryData).reduce((sum, item) => 
      sum + (item.amounts?.reduce((amountSum, amount) => amountSum + amount, 0) || 0), 0);
    const daysWithData = Object.values(categoryData).filter(item => item.count > 0).length;
    const max = Math.max(...Object.values(categoryData).map(item => item.count || 0), 0);
    const avg = daysWithData > 0 ? (total / daysWithData).toFixed(1) : 0;
    const avgAmount = daysWithData > 0 ? (totalAmount / daysWithData).toFixed(0) : 0;

    return { total, totalAmount, daysWithData, max, avg, avgAmount };
  };

  const currentCategory = categories[activeTab];
  const currentStats = calculateStats(activeTab);

  // 첫 기록일과 총 일수 계산
  const dataKeys = Object.keys(currentData);
  const firstRecordDate = dataKeys.length > 0 
    ? new Date(Math.min(...dataKeys.map(date => new Date(date).getTime())))
    : new Date();
  const totalDays = Math.ceil((new Date().getTime() - firstRecordDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // 주별로 날짜 그룹핑
  const weekGroups = [];
  for (let i = 0; i < dates.length; i += 7) {
    weekGroups.push(dates.slice(i, i + 7));
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  // 아이콘 렌더링
  const renderIcon = (iconName: string, className: string = "w-4 h-4") => {
    const IconComponent = iconMap[iconName] || Coffee;
    return <IconComponent className={className} />;
  };

  // 아이콘 선택기
  interface IconPickerProps {
    selectedIcon: string;
    onSelect: (iconName: string) => void;
    onClose: () => void;
  }

  const IconPicker: React.FC<IconPickerProps> = ({ selectedIcon, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(t('iconCategories.food'));
    
    const filteredIcons = searchTerm 
      ? Object.keys(iconMap).filter(icon => 
          icon.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : iconCategories[selectedCategory] || [];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-4xl w-full max-h-[80vh] rounded-2xl overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* 헤더 */}
          <div className="p-6 border-b border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">아이콘 선택</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* 검색 */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="아이콘 검색..."
                className={`w-full px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
                } border`}
              />
            </div>
            
            {/* 카테고리 선택 */}
            {!searchTerm && (
              <div className="flex flex-wrap gap-2">
                {Object.keys(iconCategories).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* 아이콘 그리드 */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
              {filteredIcons.map(iconName => (
                <button
                  key={iconName}
                  onClick={() => {
                    onSelect(iconName);
                    onClose();
                  }}
                  className={`p-3 rounded-lg transition-all hover:scale-110 ${
                    selectedIcon === iconName
                      ? 'bg-blue-500 text-white ring-2 ring-blue-400'
                      : isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={iconName}
                >
                  {renderIcon(iconName, "w-6 h-6")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 헤더 */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {renderIcon(currentCategory?.icon, "w-8 h-8")}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{t('title')}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* 언어 선택 드롭다운 */}
              <div className="relative min-w-[120px]">
                <select
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value as Language)}
                  className={`w-full px-3 py-2 pr-8 rounded-lg transition-colors appearance-none cursor-pointer text-sm ${
                    isDarkMode 
                      ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
                      : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-900'
                  }`}
                >
                  {Object.entries(languageNames).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                <Languages className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none opacity-60" />
              </div>
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
                    : 'bg-white hover:bg-gray-100 border border-gray-300'
                } ${showSettings ? 'scale-110' : 'hover:scale-105'}`}
                title={t('buttons.settings')}
              >
                <Settings className={`w-4 h-4 transition-transform duration-500 ${
                  showSettings ? 'rotate-180' : 'rotate-0'
                }`} />
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 border border-gray-600' 
                    : 'bg-white hover:bg-gray-100 border border-gray-300'
                }`}
                title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {isDarkMode ? '🌞' : '🌙'}
              </button>
            </div>
          </div>
          
          {/* 설정 패널 */}
          {showSettings && (
            <div className={`rounded-xl p-6 transform transition-all duration-500 ease-out animate-in slide-in-from-top-4 fade-in ${
              isDarkMode ? 'bg-gray-800' : 'bg-white border'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className={`w-5 h-5 transition-transform duration-700 ${
                    showSettings ? 'rotate-180' : 'rotate-0'
                  }`} />
                  {t('sections.categoryManagement')}
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 hover:rotate-90 ${
                    isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* 기존 카테고리 관리 */}
              <div className="space-y-3 mb-6 animate-in slide-in-from-left-4 fade-in duration-700">
                <h4 className="font-medium">{t('sections.existingCategories')}</h4>
                {Object.entries(categories).map(([id, category], index) => (
                  <div 
                    key={id} 
                    className={`p-4 rounded-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                      isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-50'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-${category.color}-500`}>
                          {renderIcon(category.icon, "w-5 h-5 text-white")}
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-sm opacity-75">
                            {category.defaultAmount}{category.unit} / {category.labels.single}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deleteCategory(id)}
                          className={`p-2 rounded-lg transition-colors ${
                            Object.keys(categories).length <= 1
                              ? 'opacity-50 cursor-not-allowed'
                              : 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
                          }`}
                          disabled={Object.keys(categories).length <= 1}
                          title={Object.keys(categories).length <= 1 ? '최소 1개 카테고리 필요' : '카테고리 삭제'}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 새 카테고리 추가 */}
              <div className={`p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:border-solid hover:shadow-md animate-in slide-in-from-right-4 fade-in duration-700 ${
                isDarkMode ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'
              }`}>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                  {t('sections.addNewCategory')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">{t('form.id')}</label>
                    <input
                      type="text"
                      value={newCategory.id}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, id: e.target.value.toLowerCase() }))}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                      } border`}
                      placeholder="water"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">{t('form.name')}</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                      } border`}
                      placeholder={t('categories.milk')}
                    />
                  </div>
                  
                  {/* 아이콘 선택 */}
                  <div>
                    <label className="block text-sm mb-2">{t('form.icon')}</label>
                    <button
                      onClick={() => setShowIconPicker(true)}
                      className={`w-full px-3 py-2 rounded-lg border flex items-center gap-2 ${
                        isDarkMode ? 'bg-gray-600 border-gray-500 hover:bg-gray-500' : 'bg-white border-gray-300 hover:bg-gray-50'
                      } transition-colors`}
                    >
                      {renderIcon(newCategory.icon, "w-5 h-5")}
                      <span>{t('form.selectIcon')}</span>
                    </button>
                  </div>
                  
                  {/* 색상 선택 */}
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-2">{t('form.color')}</label>
                    <div className="grid grid-cols-8 gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-lg bg-${color}-500 transition-transform hover:scale-110 ${
                            newCategory.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''
                          }`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">{t('form.unit')}</label>
                    <input
                      type="text"
                      value={newCategory.unit}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, unit: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                      } border`}
                      placeholder="ml"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">{t('form.defaultAmount')}</label>
                    <input
                      type="number"
                      value={newCategory.defaultAmount}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, defaultAmount: parseFloat(e.target.value) || 0 }))}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                      } border`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">{t('form.singleLabel')}</label>
                    <input
                      type="text"
                      value={newCategory.labels.single}
                      onChange={(e) => setNewCategory(prev => ({ 
                        ...prev, 
                        labels: { ...prev.labels, single: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                      } border`}
                      placeholder={t('units.single')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">{t('form.pluralLabel')}</label>
                    <input
                      type="text"
                      value={newCategory.labels.plural}
                      onChange={(e) => setNewCategory(prev => ({ 
                        ...prev, 
                        labels: { ...prev.labels, plural: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                      } border`}
                      placeholder={t('units.plural')}
                    />
                  </div>
                </div>
                <button
                  onClick={addCategory}
                  disabled={!newCategory.id || !newCategory.name}
                  className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform ${
                    !newCategory.id || !newCategory.name
                      ? 'opacity-50 cursor-not-allowed bg-gray-500 scale-95'
                      : `${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} hover:scale-105 hover:shadow-lg active:scale-95`
                  } text-white`}
                >
                  <Save className={`w-4 h-4 transition-transform duration-300 ${
                    !newCategory.id || !newCategory.name ? '' : 'group-hover:rotate-12'
                  }`} />
                  {t('buttons.add')} {t('sections.categoryManagement').split(' ')[0]}
                </button>
              </div>
            </div>
          )}
          
          {/* 탭 */}
          <div className={`rounded-xl p-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {Object.entries(categories).map(([id, category]) => {
                const isActive = activeTab === id;
                return (
                  <div key={id} className="relative group">
                    <button
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? `bg-${category.color}-500 text-white`
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className={isActive ? '' : `text-${category.color}-500`}>
                        {renderIcon(category.icon)}
                      </div>
                      {category.name}
                    </button>
                    
                    {/* 빠른 삭제 버튼 */}
                    {Object.keys(categories).length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(id);
                        }}
                        className={`absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs flex items-center justify-center hover:bg-red-600 hover:scale-110 hover:rotate-90`}
                        title={`${category.name} 삭제`}
                      >
                        <X className="w-3 h-3 transition-transform duration-200" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          

        </div>

        {/* 오늘의 카운터 */}
        {currentCategory && (
          <div className={`rounded-2xl p-6 mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white border'
          }`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              오늘의 {currentCategory.name}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => removeItem(activeTab)}
                    disabled={todayCount === 0}
                    className={`p-3 rounded-full transition-colors ${
                      todayCount === 0 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-red-500'
                    } ${isDarkMode ? 'bg-red-600' : 'bg-red-500 text-white'}`}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-1 text-${currentCategory.color}-500`}>
                      {todayCount}
                    </div>
                    <div className="text-sm opacity-75">{currentCategory.labels.plural}</div>
                  </div>
                  
                  <button
                    onClick={() => addItem(activeTab)}
                    className={`p-3 rounded-full transition-colors bg-${currentCategory.color}-600 hover:bg-${currentCategory.color}-500 ${
                      isDarkMode ? '' : 'text-white'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="text-sm opacity-75">
                    {formatDate(today)}
                  </div>
                  {todayData.amounts && todayData.amounts.length > 0 && (
                    <div className="text-xs opacity-60 mt-1">
                      총 {todayData.amounts.reduce((sum, amount) => sum + amount, 0)}{currentCategory.unit}
                    </div>
                  )}
                </div>
              </div>
              
              {/* 기본 추가량 설정 */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-sm">기본 추가량:</span>
                  <input
                    type="number"
                    value={currentCategory.defaultAmount}
                    onChange={(e) => updateCategory(activeTab, { 
                      defaultAmount: parseFloat(e.target.value) || 0 
                    })}
                    className={`w-20 px-2 py-1 rounded text-sm ${
                      isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'
                    } border`}
                  />
                  <span className="text-sm opacity-75">{currentCategory.unit}</span>
                </div>
              </div>
              
              {/* 오늘의 상세 리스트 */}
              {todayCount > 0 && (
                <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="text-sm font-medium mb-2">오늘의 {currentCategory.name} 상세</div>
                  <div className="space-y-2">
                    {todayData.amounts.map((amount, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded ${
                          isDarkMode ? 'bg-gray-600' : 'bg-white'
                        }`}
                      >
                        <span className="text-sm">
                          {index + 1}. {currentCategory.labels.single}
                        </span>
                        
                        {editingIndex === index ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className={`w-16 px-1 py-1 text-sm rounded ${
                                isDarkMode ? 'bg-gray-500' : 'bg-gray-100'
                              }`}
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateAmount(activeTab, index, editValue);
                                }
                              }}
                            />
                            <button
                              onClick={() => updateAmount(activeTab, index, editValue)}
                              className="p-1 text-green-500 hover:text-green-400"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingIndex(null)}
                              className="p-1 text-red-500 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {amount}{currentCategory.unit}
                            </span>
                            <button
                              onClick={() => {
                                setEditingIndex(index);
                                setEditValue(amount.toString());
                              }}
                              className="p-1 opacity-60 hover:opacity-100"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 통계 */}
        {currentCategory && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
              <div className="flex items-center gap-2 mb-2">
                {renderIcon(currentCategory.icon)}
                <span className="text-sm opacity-75">총 {currentCategory.name}</span>
              </div>
              <div className="text-2xl font-bold">
                {currentStats.total}{currentCategory.labels.plural}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {currentStats.totalAmount}{currentCategory.unit}
              </div>
            </div>
            
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-sm opacity-75">추적 기간</span>
              </div>
              <div className="text-2xl font-bold">{dataKeys.length > 0 ? totalDays : 0}일</div>
            </div>
            
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                <span className="text-sm opacity-75">일평균</span>
              </div>
              <div className="text-2xl font-bold">
                {currentStats.avg}{currentCategory.labels.plural}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {currentStats.avgAmount}{currentCategory.unit}
              </div>
            </div>
            
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <span className="text-sm opacity-75">최고 기록</span>
              </div>
              <div className="text-2xl font-bold">
                {currentStats.max}{currentCategory.labels.plural}
              </div>
            </div>
          </div>
        )}

        {/* 히트맵 */}
        {currentCategory && (
          <div className={`rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {currentCategory.name} 히트맵
              </h2>
              <div className="text-sm opacity-75 mt-2 sm:mt-0">
                {dataKeys.length > 0 ? (
                  <>
                    {firstRecordDate.toLocaleDateString('ko-KR')} ~ 오늘 
                    <span className="ml-2">({totalDays}일)</span>
                  </>
                ) : (
                  '아직 기록이 없습니다'
                )}
              </div>
            </div>
            
            {/* 요일 라벨 */}
            <div className="flex mb-2">
              <div className="w-12"></div>
              <div className="grid grid-cols-7 gap-1 text-xs opacity-75">
                <div>일</div>
                <div>월</div>
                <div>화</div>
                <div>수</div>
                <div>목</div>
                <div>금</div>
                <div>토</div>
              </div>
            </div>

            {/* 히트맵 그리드 */}
            {dates.length > 0 ? (
              <div className="flex gap-1 overflow-x-auto pb-2">
                {weekGroups.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((date, dayIndex) => {
                      const dayData = currentData[date];
                      const count = dayData?.count || 0;
                      const totalAmount = dayData?.amounts?.reduce((sum, amount) => sum + amount, 0) || 0;
                      const colorClass = getItemColor(currentCategory.color, count);
                      
                      return (
                        <div
                          key={date}
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-${currentCategory.color}-400 ${colorClass}`}
                          onClick={() => setSelectedDate(date)}
                          title={`${date}: ${count}${currentCategory.labels.plural}${
                            totalAmount > 0 ? ` (${totalAmount}${currentCategory.unit})` : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 opacity-75">
                {currentCategory.name}을 추가해서 기록을 시작해보세요! 🎯
              </div>
            )}

            {/* 범례 */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs opacity-75">적음</div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded-sm ${getItemColor(currentCategory.color, level)}`}
                  />
                ))}
              </div>
              <div className="text-xs opacity-75">많음</div>
            </div>
          </div>
        )}

        {/* 후원 섹션 */}
        {currentCategory && (
          <div className={`mt-6 rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              {t('sections.donation')}
            </h2>
            
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <CoffeeIcon className="w-8 h-8 text-amber-500" />
                  <Heart className="w-6 h-6 text-red-500" />
                  <Apple className="w-6 h-6 text-red-500" />
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-2">{t('donation.title')}</h3>
              <p className="text-sm opacity-75 mb-6 max-w-md mx-auto">
                {t('donation.description')}
              </p>
              
              <button
                onClick={() => setShowDonationModal(true)}
                className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto ${
                  isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } text-white font-medium`}
              >
                <Heart className="w-5 h-5" />
                {t('buttons.donate')}
              </button>
              
              <div className="mt-6 grid grid-cols-5 gap-2 text-xs opacity-60">
                {donationOptions.map((option) => (
                  <div key={option.id} className="text-center">
                    <div className="font-medium">{option.label}</div>
                    <div>{formatAmount(option.amount, option.currency)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 선택된 날짜 정보 */}
        {selectedDate && currentCategory && (
          <div className={`mt-6 rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white border'}`}>
            <h3 className="text-lg font-semibold mb-3">날짜별 상세</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{formatDate(selectedDate)}</div>
                <div className="text-sm opacity-75 mt-1">
                  {currentCategory.name} {currentData[selectedDate]?.count || 0}{currentCategory.labels.plural} 섭취
                  {currentData[selectedDate]?.amounts && (
                    <span className="ml-2">
                      (총 {currentData[selectedDate].amounts.reduce((sum, amount) => sum + amount, 0)}{currentCategory.unit})
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm opacity-75 hover:opacity-100"
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 아이콘 선택기 모달 */}
      {showIconPicker && (
        <IconPicker
          selectedIcon={newCategory.icon}
          onSelect={(iconName) => setNewCategory(prev => ({ ...prev, icon: iconName }))}
          onClose={() => setShowIconPicker(false)}
        />
      )}
      
      {/* 후원 모달 */}
      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
      />
    </div>
  );
};

export default FlexibleCounter;