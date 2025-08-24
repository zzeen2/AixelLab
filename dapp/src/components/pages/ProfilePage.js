import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import MainTemplate from '../templates/MainTemplate';
import UserAvatar from '../atoms/ui/UserAvatar';
import { getUserArtworks, getUserStats, getMintedNFTs } from '../../api/user';
import { getWalletStatus, createWallet } from '../../api/auth';
import { getPendingMints, executeMinting } from '../../api/voting';
import { getSmartAccount, getSmartAccountPredict, getAxcBalance, getListing, getNFTOwner } from '../../api/marketplace';


const Header = styled.div`
  padding: 0;
  background: linear-gradient(135deg, #0d1017 0%, #1a1a1a 100%);
`;

const HeaderTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

const ProfileSection = styled.div`
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0;
`;

const ProfileHeader = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: center;
  column-gap: 20px;
  row-gap: 0;
`;

const AvatarSection = styled.div`
  position: relative;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0;
  box-shadow: none;
`;

const StyledAvatar = styled(UserAvatar)`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: none;
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;

  > div {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

const ProfileName = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
`;



const WalletSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const WalletAddress = styled.div`
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.03);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  word-break: break-all;
  display: inline-block;
  width: fit-content;
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }
`;

const CreateWalletButton = styled.button`
  background: #7877c6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
  
  &:hover {
    background: #6b6ab8;
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
  }
`;

const WalletStatus = styled.div`
  font-size: 13px;
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
`;

const WalletHint = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const ProfileStats = styled.div`
  display: flex;
  gap: 32px;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// 검색 및 필터 섹션
const SearchSection = styled.div`
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const TabButton = styled(FilterButton)`
  background: ${props => props.active ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)'};
  border-color: ${props => props.active ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#ffffff' : 'rgba(255, 255, 255, 0.8)'};
`;

const FilterRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

// 메인 컨텐츠
const MainContent = styled.div`
  min-height: calc(100vh - 400px);
`;

const ArtworkGrid = styled.div`
  padding: 24px 32px;
`;

const GridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ResultCount = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
`;

// 아트워크 카드 스타일
const ArtworkCard = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.3);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(139, 92, 246, 0.2);
  }
`;

const ArtworkImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ArtworkOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%);
  padding: 16px;
  color: #ffffff;
`;

const ArtworkOverlayTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const ArtworkOverlayDescription = styled.p`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
`;

const ArtworkInfo = styled.div`
  padding: 12px;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ArtworkTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtworkDescription = styled.p`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtworkStatus = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  display: inline-block;
  
  &.pending {
    color: #ffc107;
  }
  
  &.minted {
    color: #4ade80;
  }
  
  &.failed {
    color: #ef4444;
  }
`;

const NFTInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 2px;
`;

const NFTId = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
`;

const NFTPrice = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
`;

const LastSale = styled.div`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 1px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
`;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const EmptyTitle = styled.h3`
  color: #ffffff;
  font-size: 20px;
  margin: 0 0 8px 0;
`;

const EmptyText = styled.p`
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin: 0;
`;

const MintedBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #8b5cf6;
  color: #8b5cf6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
`;

// 모달 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(12px);
`;

const ModalContent = styled.div`
  position: relative;
  background: rgba(18, 18, 22, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 32px;
  width: 440px;
  max-width: 92vw;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 20px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(139,92,246,0.35), rgba(236,72,153,0.25));
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    pointer-events: none;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const ModalTitle = styled.h2`
  color: #ffffff;
  margin: 0;
  font-size: 20px;
  font-weight: 700;
`;

const ModalSubtitle = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 12px;
  margin-right: 12px;
`;

const FieldLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
`;

const PasswordInput = styled.input`
  width: 100%;
  padding: 14px 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
    background: rgba(255, 255, 255, 0.08);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.45);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 14px;
`;

const ModalButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: linear-gradient(135deg, #7877c6 0%, #ff77c6 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(120, 119, 198, 0.4);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// 카드 호버 시 나타나는 민팅 버튼
const HoverMintButton = styled(CreateWalletButton)`
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  width: auto;
  z-index: 2;
  opacity: 0;
  transform: translateY(6px);
  transition: all 0.2s ease;

  ${ArtworkCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ProfilePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('all');
    
    // URL 파라미터에서 탭 정보 읽기
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabParam = urlParams.get('tab');
        const refreshParam = urlParams.get('refresh');
        
        if (tabParam && ['all', 'pending', 'mynfts', 'onSale', 'rejected'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        
        // refresh 파라미터가 있으면 listing 정보 새로고침
        if (refreshParam === 'true') {
            // URL에서 refresh 파라미터 제거
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('refresh');
            window.history.replaceState({}, '', newUrl);
        }
    }, [location.search]);
    const [userInfo, setUserInfo] = useState(null);
    const [artworks, setArtworks] = useState([]);
    const [listingByToken, setListingByToken] = useState({});
    const [stats, setStats] = useState(null);
    const [smartAccount, setSmartAccount] = useState(null);
    const [axcBalance, setAxcBalance] = useState('0.00');
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArtworks, setFilteredArtworks] = useState([]);
    
    // 지갑 관련 state
    const [walletStatus, setWalletStatus] = useState(null);
    const [showCreateWalletModal, setShowCreateWalletModal] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);
    
    // 민팅 관련 state
    const [pendingMints, setPendingMints] = useState([]);
    const [mintedNFTs, setMintedNFTs] = useState([]);
    const [showMintingModal, setShowMintingModal] = useState(false);
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [mintingPassword, setMintingPassword] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    // 탭별 작품 필터링
    const getFilteredArtworks = () => {
        console.log('ProfilePage - activeTab:', activeTab);
        console.log('ProfilePage - artworks:', artworks);
        console.log('ProfilePage - listingByToken:', listingByToken);
        
        switch (activeTab) {
            case 'all':
                return artworks;
            case 'pending':
                return artworks.filter(a => a.status === 'pending' || a.status === 'approved');
            case 'mynfts':
                return artworks.filter(a => a.status === 'minted' && (!!a.owner_address ? a.owner_address?.toLowerCase() === userInfo?.wallet_address?.toLowerCase() : true));
            case 'onSale':
                const onSaleArtworks = artworks.filter(a => {
                    const isMinted = a.status === 'minted';
                    const hasTokenId = a.token_id != null && typeof a.token_id === 'number';
                    const hasActiveListing = listingByToken[a.token_id]?.active;
                    
                    console.log(`ProfilePage - Artwork ${a.id} (token ${a.token_id}):`, {
                        isMinted,
                        hasTokenId,
                        hasActiveListing,
                        listingInfo: listingByToken[a.token_id]
                    });
                    
                    return isMinted && hasTokenId && hasActiveListing;
                });
                console.log('ProfilePage - onSaleArtworks:', onSaleArtworks);
                return onSaleArtworks;
            case 'rejected':
                return artworks.filter(a => a.status === 'failed');
            default:
                return artworks;
        }
    };

    // 탭 카운트 미리 계산
    const tabCounts = {
        all: artworks.length,
        pending: artworks.filter(a => a.status === 'pending' || a.status === 'approved').length,
        mynfts: artworks.filter(a => a.status === 'minted' && (!!a.owner_address ? a.owner_address?.toLowerCase() === userInfo?.wallet_address?.toLowerCase() : true)).length,
        onSale: artworks.filter(a => a.status === 'minted' && a.token_id != null && typeof a.token_id === 'number' && listingByToken[a.token_id]?.active).length,
        rejected: artworks.filter(a => a.status === 'failed').length
    };

    // 검색 및 필터링
    useEffect(() => {
        let filtered = getFilteredArtworks();

        // 검색 필터
        if (searchTerm) {
            filtered = filtered.filter(artwork => 
                artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (artwork.description && artwork.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        setFilteredArtworks(filtered);
    }, [artworks, activeTab, searchTerm, listingByToken]);

    // 민팅된 tokenId의 리스팅 정보 수집 (On Sale 탭 사용)
    useEffect(() => {
        const mintedWithToken = artworks.filter(a => a.status === 'minted' && a.token_id != null && typeof a.token_id === 'number');
        console.log('ProfilePage - mintedWithToken:', mintedWithToken);
        if (!mintedWithToken.length) {
            setListingByToken({});
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                // 요청을 순차적으로 처리하여 RPC 부하 감소
                const map = {};
                
                for (let i = 0; i < mintedWithToken.length; i++) {
                    if (cancelled) return;
                    
                    const tk = mintedWithToken[i].token_id;
                    
                    try {
                        // 각 요청 사이에 1초 지연 (RPC 제한 회피)
                        if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // listing 정보만 조회 (RPC 부하 감소)
                        let listingResult = null;
                        
                        // listing 정보 조회 (최대 3회 재시도)
                        for (let retry = 0; retry < 3; retry++) {
                            try {
                                listingResult = await getListing(tk);
                                break;
                            } catch (error) {
                                if (retry < 2) {
                                    console.log(`ProfilePage - Retrying listing for token ${tk}, attempt ${retry + 1}`);
                                    await new Promise(resolve => setTimeout(resolve, 2000 * (retry + 1)));
                                } else {
                                    console.error(`ProfilePage - Failed to get listing for token ${tk} after 3 retries:`, error);
                                    break;
                                }
                            }
                        }
                        
                        console.log(`ProfilePage - getListing for token ${tk}:`, listingResult);
                        
                        if (listingResult?.success) {
                            map[tk] = listingResult.listing;
                            console.log(`ProfilePage - token ${tk} listing active:`, listingResult.listing.active);
                            console.log(`ProfilePage - token ${tk} listing seller:`, listingResult.listing.seller);
                            console.log(`ProfilePage - token ${tk} listing price:`, listingResult.listing.price);
                            
                            // NFT 소유권 확인
                            try {
                                const ownerResult = await getNFTOwner(tk);
                                if (ownerResult?.success) {
                                    console.log(`ProfilePage - token ${tk} owner:`, ownerResult.owner);
                                    console.log(`ProfilePage - token ${tk} Smart Account:`, '0x218d167FA0C1a54136dFCA003aD5B3871EC55427');
                                    console.log(`ProfilePage - token ${tk} owner matches Smart Account:`, ownerResult.owner.toLowerCase() === '0x218d167FA0C1a54136dFCA003aD5B3871EC55427'.toLowerCase());
                                }
                            } catch (ownerError) {
                                console.error(`ProfilePage - Error getting owner for token ${tk}:`, ownerError);
                            }
                        } else {
                            console.log(`ProfilePage - token ${tk} listing failed:`, listingResult);
                        }
                    } catch (error) {
                        console.error(`ProfilePage - Error fetching data for token ${tk}:`, error);
                    }
                }
                
                if (!cancelled) {
                    console.log('ProfilePage - listingByToken map:', map);
                    setListingByToken(map);
                }
            } catch (error) {
                console.error('ProfilePage - Error in listing fetch:', error);
                if (!cancelled) setListingByToken({});
            }
        })();
        return () => { cancelled = true; };
    }, [artworks]);

    // refresh 파라미터가 있을 때 listing 정보 새로고침
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const refreshParam = urlParams.get('refresh');
        
        if (refreshParam === 'true' && artworks.length > 0) {
            // 10초 후 새로고침 (블록체인 반영 시간 고려)
            setTimeout(() => {
                const mintedWithToken = artworks.filter(a => a.status === 'minted' && a.token_id != null && typeof a.token_id === 'number');
                if (mintedWithToken.length > 0) {
                    (async () => {
                        try {
                            const map = {};
                            for (let i = 0; i < mintedWithToken.length; i++) {
                                const tk = mintedWithToken[i].token_id;
                                
                                // 각 요청 사이에 1초 지연 (RPC 제한 회피)
                                if (i > 0) await new Promise(resolve => setTimeout(resolve, 1000));
                                
                                try {
                                    // 재시도 로직 추가
                                    let result = null;
                                    for (let retry = 0; retry < 3; retry++) {
                                        try {
                                            result = await getListing(tk);
                                            break;
                                        } catch (error) {
                                            if (retry < 2) {
                                                console.log(`Refresh - Retrying listing for token ${tk}, attempt ${retry + 1}`);
                                                await new Promise(resolve => setTimeout(resolve, 2000 * (retry + 1)));
                                            } else {
                                                throw error;
                                            }
                                        }
                                    }
                                    
                                    if (result?.success) {
                                        map[tk] = result.listing;
                                    }
                                } catch (error) {
                                    console.error(`Refresh - Error fetching listing for token ${tk}:`, error);
                                }
                            }
                            setListingByToken(prev => ({ ...prev, ...map }));
                        } catch (error) {
                            console.error('Listing 정보 새로고침 실패:', error);
                        }
                    })();
                }
            }, 3000);
        }
    }, [location.search, artworks]);

    // 민팅 대기 목록 조회
    const fetchPendingMints = async () => {
        try {
            const response = await getPendingMints();
            if (response.success) {
                setPendingMints(response.pendingMints);
            }
        } catch (error) {
            console.error('민팅 대기 목록 조회 실패:', error);
        }
    };

    // 민팅된 NFT 목록 조회
    const fetchMintedNFTs = async () => {
        try {
            const response = await getMintedNFTs();
            if (response.success) {
                setMintedNFTs(response.minted_nfts);
            }
        } catch (error) {
            console.error('민팅된 NFT 조회 실패:', error);
        }
    };

    // 민팅 실행
    const handleMinting = async () => {
        if (userInfo?.login_type === 'google' && !mintingPassword) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        
        setIsMinting(true);
        try {
            const response = await executeMinting(selectedProposal.id, mintingPassword);
            if (response.success) {
                alert('NFT 민팅이 성공적으로 완료되었습니다!');
                setShowMintingModal(false);
                setMintingPassword('');
                setSelectedProposal(null);
                await fetchPendingMints();
                await fetchMintedNFTs();
            }
        } catch (error) {
            alert('민팅에 실패했습니다: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsMinting(false);
        }
    };

    // 지갑 상태 조회
    const fetchWalletStatus = async () => {
        try {
            const response = await getWalletStatus();
            if (response.success && response.wallet) {
                setWalletStatus(response.wallet);
                return response.wallet;
            } else {
                setWalletStatus(response);
                return response.wallet || null;
            }
        } catch (error) {
            console.error('지갑 상태 조회 실패:', error);
            return null;
        }
    };

    // 지갑 생성
    const handleCreateWallet = async () => {
        if (!password || !confirmPassword) {
            alert('비밀번호를 입력해주세요.');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (password.length < 8) {
            alert('비밀번호는 8자 이상이어야 합니다.');
            return;
        }
        
        setIsCreatingWallet(true);
        try {
            const response = await createWallet(password);
            if (response.success) {
                alert('Wallet created successfully!');
                setShowCreateWalletModal(false);
                setPassword('');
                setConfirmPassword('');
                await fetchWalletStatus();
                
                const currentUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                const updatedUserInfo = {
                    ...currentUserInfo,
                    wallet_created: true,
                    eoa_address: response.eoaAddress
                };
                localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
                setUserInfo(updatedUserInfo);
                
                setWalletStatus({
                    walletCreated: true,
                    eoaAddress: response.eoaAddress,
                    loginType: 'google'
                });

                // Smart Account 및 잔액 즉시 갱신
                try {
                    const saRes = await getSmartAccount(response.eoaAddress);
                    if (saRes.success) {
                        setSmartAccount(saRes.smartAccount);
                        const balRes = await getAxcBalance(saRes.smartAccount);
                        if (balRes.success) setAxcBalance(Number(balRes.balance).toFixed(2));
                    }
                } catch (e) {
                    console.log('post-create balance fetch failed', e.message);
                }
            }
        } catch (error) {
            alert('지갑 생성에 실패했습니다: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsCreatingWallet(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    setUserInfo(JSON.parse(userInfo));
                    if (JSON.parse(userInfo).login_type === 'google') {
                        const wallet = await fetchWalletStatus();
                        // Smart Account 및 AXC 잔액 조회 (응답값 기준)
                        const eoa = JSON.parse(userInfo).eoa_address || wallet?.eoaAddress;
                        if (eoa) {
                            try {
                                // 배포 여부만 확인 (생성 트랜잭션 발생 안 함)
                                const saPred = await getSmartAccountPredict(eoa);
                                if (saPred.success) {
                                    setSmartAccount(saPred.smartAccount);
                                    if (saPred.deployed) {
                                        const balRes = await getAxcBalance(saPred.smartAccount);
                                        if (balRes.success) setAxcBalance(Number(balRes.balance).toFixed(2));
                                    } else {
                                        setAxcBalance('0.00');
                                    }
                                }
                            } catch (e) {
                                console.log('AXC balance fetch failed');
                            }
                        }
                    }
                }

                try {
                    const artworksResponse = await getUserArtworks();
                    if (artworksResponse.success) {
                        setArtworks(artworksResponse.artworks);
                    }
                } catch (error) {
                    console.error('작품 조회 실패:', error);
                    setArtworks([]);
                }

                try {
                    const statsResponse = await getUserStats();
                    if (statsResponse.success) {
                        setStats({
                            axc: axcBalance || "0.00",
                            artworks: statsResponse.stats.total_artworks.toString(),
                            approved: statsResponse.stats.approved_artworks.toString()
                        });
                    }
                } catch (error) {
                    console.error('통계 조회 실패:', error);
                    setStats({
                        axc: axcBalance || "0.00",
                         artworks: "0",
                         approved: "0"
                    });
                }

                try {
                    await fetchPendingMints();
                } catch (error) {
                    console.error('민팅 대기 목록 조회 실패:', error);
                }

                try {
                    await fetchMintedNFTs();
                } catch (error) {
                    console.error('민팅된 NFT 조회 실패:', error);
                }

            } catch (error) {
                console.error('사용자 정보 조회 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <MainTemplate>
                <div>
                    <LoadingContainer>
                        Loading...
                    </LoadingContainer>
                </div>
            </MainTemplate>
        );
    }

    return (
        <MainTemplate>
            <div>
                <Header>
                </Header>

                <ProfileSection>
                    {userInfo && (
                        <>
                            <ProfileHeader>
                                <AvatarSection>
                                    <AvatarContainer>
                                        <StyledAvatar user={userInfo} size="80px" />
                                    </AvatarContainer>
                                </AvatarSection>
                                <ProfileInfo>
                                    <div>
                                        <ProfileName>{userInfo.display_name || 'Anonymous User'}</ProfileName>
                                        
                                        {userInfo.login_type === 'google' ? (
                                            <WalletSection>
                                                {walletStatus?.walletCreated ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <WalletAddress
                                                            onClick={() => {
                                                                if (walletStatus.eoaAddress) {
                                                                    navigator.clipboard.writeText(walletStatus.eoaAddress);
                                                                    alert('주소가 복사되었습니다!');
                                                                }
                                                            }}
                                                            title="클릭하여 전체 주소 복사"
                                                        >
                                                            {walletStatus.eoaAddress || 'loading...'}
                                                        </WalletAddress>
                                                        <WalletStatus>✓ 지갑 사용 가능</WalletStatus>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <WalletAddress title="You need a wallet to mint and trade NFTs">Wallet not created</WalletAddress>
                                                        <WalletHint>To mint and trade NFTs, please create your wallet.</WalletHint>
                                                        <CreateWalletButton onClick={() => setShowCreateWalletModal(true)}>
                                                            Create Wallet
                                                        </CreateWalletButton>
                                                    </>
                                                )}
                                            </WalletSection>
                                        ) : (
                                            <>
                                                <WalletAddress>
                                                    {userInfo.wallet_address && userInfo.wallet_address !== '0x0000000000000000000000000000000000000000' 
                                                        ? userInfo.wallet_address
                                                        : 'no wallet connected'
                                                    }
                                                </WalletAddress>
                                                {userInfo.wallet_address && userInfo.wallet_address !== '0x0000000000000000000000000000000000000000' && (
                                                    <WalletStatus>✓ 지갑 사용 가능</WalletStatus>
                                                )}
                                            </>
                                        )}
                                        
                                        <ProfileStats>
                                            <StatItem>
                                                <StatValue>{stats?.artworks || '0'}</StatValue>
                                                <StatLabel>Artworks</StatLabel>
                                            </StatItem>
                                            <StatItem>
                                                <StatValue>{stats?.approved || '0'}</StatValue>
                                                <StatLabel>Approved</StatLabel>
                                            </StatItem>
                                            <StatItem>
                                                <StatValue>{axcBalance}</StatValue>
                                                <StatLabel>AXC</StatLabel>
                                            </StatItem>
                                        </ProfileStats>
                                        
                                    </div>
                                </ProfileInfo>
                            </ProfileHeader>
                        </>
                    )}
                </ProfileSection>

                <SearchSection>
                    <SearchContainer>
                        <SearchInput
                            placeholder="Search by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FilterButton>
                            <span>🎨</span>
                            Filters
                        </FilterButton>
                    </SearchContainer>
                    
                    <FilterRow>
                        <TabButton
                            active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                        >
                            All ({tabCounts.all})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'pending'}
                            onClick={() => setActiveTab('pending')}
                        >
                            Pending ({tabCounts.pending})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'mynfts'}
                            onClick={() => setActiveTab('mynfts')}
                        >
                            My NFTs ({tabCounts.mynfts})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'onSale'}
                            onClick={() => {
                                setActiveTab('onSale');
                                // On Sale 탭 클릭 시 listingByToken 새로고침
                                const mintedWithToken = artworks.filter(a => a.status === 'minted' && a.token_id != null);
                                if (mintedWithToken.length > 0) {
                                    (async () => {
                                        try {
                                            const results = await Promise.allSettled(mintedWithToken.map(a => getListing(a.token_id)));
                                            const map = {};
                                            results.forEach((r, idx) => {
                                                const tk = mintedWithToken[idx].token_id;
                                                if (r.status === 'fulfilled' && r.value?.success) map[tk] = r.value.listing;
                                            });
                                            setListingByToken(map);
                                        } catch {}
                                    })();
                                }
                            }}
                        >
                            On Sale ({tabCounts.onSale})
                        </TabButton>
                        <TabButton
                            active={activeTab === 'rejected'}
                            onClick={() => setActiveTab('rejected')}
                        >
                            Rejected ({tabCounts.rejected})
                        </TabButton>
                    </FilterRow>
                </SearchSection>

                <MainContent>
                    <ArtworkGrid>
                        <GridHeader>
                            <ResultCount>{filteredArtworks.length} items</ResultCount>
                        </GridHeader>
                        
                        {loading ? (
                            <LoadingContainer>
                                Loading artworks...
                            </LoadingContainer>
                        ) : filteredArtworks.length === 0 ? (
                            <EmptyContainer>
                                <EmptyTitle>No artworks found</EmptyTitle>
                                <EmptyText>
                                    {artworks.length === 0 
                                        ? "No artworks created yet. Create your first artwork!"
                                        : "No artworks match your current filters."
                                    }
                                </EmptyText>
                            </EmptyContainer>
                        ) : (
                            <GridContainer>
                                {filteredArtworks.map((artwork) => (
                                    <ArtworkCard 
                                        key={artwork.id}
                                        onClick={() => {
                                            if (artwork.status === 'pending' && artwork.proposal) {
                                                navigate(`/voting/${artwork.proposal.id}`);
                                            } else {
                                                navigate(`/artwork/${artwork.id}`, { state: { backgroundLocation: location } });
                                            }
                                        }}
                                    >
                                        {artwork.status === 'minted' && (
                                            <MintedBadge>NFT</MintedBadge>
                                        )}
                                        <ArtworkImage 
                                            src={artwork.image_ipfs_uri} 
                                            alt={artwork.title}
                                            onError={(e) => {
                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPgo=';
                                            }}
                                        />
                                        <ArtworkOverlay>
                                            <ArtworkOverlayTitle>{artwork.title}</ArtworkOverlayTitle>
                                            <ArtworkOverlayDescription>
                                                {artwork.description || 'No description'}
                                            </ArtworkOverlayDescription>
                                        </ArtworkOverlay>
                                        <ArtworkInfo>
                                            {artwork.status === 'minted' ? (
                                                <>
                                                    <NFTInfo>
                                                        <NFTId>#{artwork.token_id || 'N/A'}</NFTId>
                                                    </NFTInfo>
                                                    <NFTPrice>Price: {artwork.price || '0.00'} ETH</NFTPrice>
                                                    {artwork.last_sale && (
                                                        <LastSale>Last sale {artwork.last_sale} ETH</LastSale>
                                                    )}
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                    <ArtworkStatus className={
                                                        artwork.status === 'pending' ? 'pending' :
                                                        artwork.status === 'failed' ? 'failed' : 'pending'
                                                    }>
                                                        {artwork.status === 'pending' ? 'Under Review' : 
                                                         artwork.status === 'failed' ? 'Rejected' : 'Under Review'}
                                                    </ArtworkStatus>
                                                    {artwork.proposal && (
                                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                                            {artwork.proposal.votes_for || 0}/{artwork.proposal.threshold || 10} votes
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </ArtworkInfo>

                                        {/* Hover 시 민팅 버튼 */}
                                        {activeTab === 'pending' && artwork.status === 'pending' && artwork.proposal && (
                                            <HoverMintButton 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedProposal(artwork.proposal);
                                                    if (userInfo?.login_type === 'metamask') {
                                                        setIsMinting(true);
                                                        executeMinting(artwork.proposal.id, null)
                                                            .then(response => {
                                                                if (response.success) {
                                                                    alert('NFT 민팅이 성공적으로 완료되었습니다!');
                                                                    fetchPendingMints();
                                                                    fetchMintedNFTs();
                                                                }
                                                            })
                                                            .catch(error => {
                                                                alert('민팅에 실패했습니다: ' + (error.response?.data?.error || error.message));
                                                            })
                                                            .finally(() => {
                                                                setIsMinting(false);
                                                            });
                                                    } else {
                                                        setShowMintingModal(true);
                                                    }
                                                }}
                                            >
                                                {isMinting ? 'Minting...' : 'Mint NFT'}
                                            </HoverMintButton>
                                        )}
                                    </ArtworkCard>
                                ))}
                            </GridContainer>
                        )}
                    </ArtworkGrid>
                </MainContent>
            </div>
            
            {/* 지갑 생성 모달 */}
            {showCreateWalletModal && (
                <Modal>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Create Wallet</ModalTitle>
                            <ModalSubtitle>
                                Set a secure password. You will need this password to mint and trade NFTs.
                            </ModalSubtitle>
                        </ModalHeader>
                        
                        <FieldGroup>
                            <FieldLabel>Password (8+ characters)</FieldLabel>
                            <PasswordInput
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </FieldGroup>
                        
                        <FieldGroup style={{ marginTop: '10px' }}>
                            <FieldLabel>Confirm password</FieldLabel>
                            <PasswordInput
                                type="password"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </FieldGroup>
                        
                        <ModalButtons>
                            <ModalButton 
                                className="secondary" 
                                onClick={() => {
                                    setShowCreateWalletModal(false);
                                    setPassword('');
                                    setConfirmPassword('');
                                }}
                            >
                                Cancel
                            </ModalButton>
                            <ModalButton 
                                className="primary" 
                                onClick={handleCreateWallet}
                                disabled={isCreatingWallet}
                            >
                                {isCreatingWallet ? 'Creating...' : 'Create Wallet'}
                            </ModalButton>
                        </ModalButtons>
                    </ModalContent>
                </Modal>
            )}

            {/* 민팅 모달 */}
            {showMintingModal && selectedProposal && (
                <Modal>
                    <ModalContent>
                        <ModalTitle>NFT 민팅</ModalTitle>
                        {userInfo?.login_type === 'google' ? (
                            <>
                                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '16px' }}>
                                    민팅하려면 지갑 비밀번호를 입력해주세요.
                                </p>
                                
                                <PasswordInput
                                    type="password"
                                    placeholder="민팅 비밀번호"
                                    value={mintingPassword}
                                    onChange={(e) => setMintingPassword(e.target.value)}
                                />
                            </>
                        ) : (
                            <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', marginBottom: '16px' }}>
                                MetaMask 지갑으로 민팅을 진행합니다.
                            </p>
                        )}
                        
                        <ModalButtons>
                            <ModalButton 
                                className="secondary" 
                                onClick={() => {
                                    setShowMintingModal(false);
                                    setMintingPassword('');
                                    setSelectedProposal(null);
                                }}
                            >
                                취소
                            </ModalButton>
                            <ModalButton 
                                className="primary" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleMinting();
                                }}
                                disabled={isMinting}
                            >
                                {isMinting ? '민팅 중...' : 'NFT 민팅하기'}
                            </ModalButton>
                        </ModalButtons>
                    </ModalContent>
                </Modal>
            )}
        </MainTemplate>
    );
};

export default ProfilePage; 