const express = require('express');
const router = express.Router();
const { getCurrentUser } = require('../utils/auth');
const contractManager = require('../utils/contractManager');
const db = require('../models');
const { ethers } = require('ethers');

// 리스트 등록
router.post('/list', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const { tokenId, password } = req.body;
    let { price } = req.body;
    
    console.log('=== 리스트 등록 요청 ===');
    console.log('tokenId:', tokenId, 'type:', typeof tokenId);
    console.log('price:', price, 'type:', typeof price);
    console.log('currentUser:', currentUser);
    
    if (tokenId === undefined) {
      return res.status(400).json({ error: 'tokenId is required' });
    }

    // 가격이 비어 있으면: 해당 토큰ID로 민팅된 제안서의 초기 가격을 기본값으로 사용
    if (price === undefined || price === null || String(price).trim() === '') {
      try {
        const proposal = await db.Proposal.findOne({ where: { nft_token_id: Number(tokenId) } });
        if (proposal && proposal.initial_price_units != null) {
          const units = typeof proposal.initial_price_units === 'string' ? Number(proposal.initial_price_units) : Number(proposal.initial_price_units);
          if (!Number.isNaN(units)) {
            price = (units / 1e6).toString();
          }
        }
      } catch (e) {}
    }

    // 최종 가격 검증
    if (price === undefined || price === null || String(price).trim() === '') {
      return res.status(400).json({ error: 'price is required (or set initial price during voting)' });
    }
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'invalid price' });
    }

    const userType = currentUser.loginType === 'google' ? 'google' : 'metamask';
    let signerOrSig = null;
    if (userType === 'google' && password) {
      const { createPasswordBasedWallet } = require('../utils/walletGenerator');
      signerOrSig = createPasswordBasedWallet(currentUser.user.google_id, password);
    } else if (userType === 'metamask' && req.body.signature) {
      signerOrSig = req.body.signature;
    }

    // 주소 정규화: 구글은 eoa_address 우선, 메타마스크는 wallet_address 우선
    const rawAddress = userType === 'google'
      ? (currentUser.user.eoa_address || currentUser.user.wallet_address)
      : (currentUser.user.wallet_address || currentUser.user.eoa_address);
    let artistAddress;
    try { artistAddress = ethers.getAddress(String(rawAddress || '')); } catch { return res.status(400).json({ error: `invalid address: ${rawAddress}` }); }
    const result = await contractManager.listOnMarketplace(artistAddress, Number(tokenId), priceNum, signerOrSig, userType);
    if (!result.success) return res.status(500).json({ error: result.error || 'List failed' });

    res.json({ success: true, transactionHash: result.transactionHash });
  } catch (e) {
    console.error('list error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 리스트 취소
router.post('/cancel', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const { tokenId, password } = req.body;
    if (tokenId === undefined) return res.status(400).json({ error: 'tokenId is required' });

    const userType = currentUser.loginType === 'google' ? 'google' : 'metamask';
    let signerOrSig = null;
    if (userType === 'google' && password) {
      const { createPasswordBasedWallet } = require('../utils/walletGenerator');
      signerOrSig = createPasswordBasedWallet(currentUser.user.google_id, password);
    } else if (userType === 'metamask' && req.body.signature) {
      signerOrSig = req.body.signature;
    }

    const rawAddress = userType === 'google'
      ? (currentUser.user.eoa_address || currentUser.user.wallet_address)
      : (currentUser.user.wallet_address || currentUser.user.eoa_address);
    let artistAddress;
    try { artistAddress = ethers.getAddress(String(rawAddress || '')); } catch { return res.status(400).json({ error: `invalid address: ${rawAddress}` }); }
    const result = await contractManager.cancelListing(artistAddress, Number(tokenId), signerOrSig, userType);
    if (!result.success) return res.status(500).json({ error: result.error || 'Cancel failed' });

    res.json({ success: true, transactionHash: result.transactionHash });
  } catch (e) {
    console.error('cancel error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 구매
router.post('/buy', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const { tokenId, password } = req.body;
    if (tokenId === undefined) return res.status(400).json({ error: 'tokenId is required' });

    const userType = currentUser.loginType === 'google' ? 'google' : 'metamask';
    let signerOrSig = null;
    if (userType === 'google' && password) {
      const { createPasswordBasedWallet } = require('../utils/walletGenerator');
      signerOrSig = createPasswordBasedWallet(currentUser.user.google_id, password);
    } else if (userType === 'metamask' && req.body.signature) {
      signerOrSig = req.body.signature;
    }

    const rawAddress = userType === 'google'
      ? (currentUser.user.eoa_address || currentUser.user.wallet_address)
      : (currentUser.user.wallet_address || currentUser.user.eoa_address);
    let buyerAddress;
    try { buyerAddress = ethers.getAddress(String(rawAddress || '')); } catch { return res.status(400).json({ error: `invalid address: ${rawAddress}` }); }
    const result = await contractManager.buyOnMarketplace(buyerAddress, Number(tokenId), signerOrSig, userType);
    if (!result.success) return res.status(500).json({ error: result.error || 'Buy failed' });

    res.json({ success: true, transactionHash: result.transactionHash });
  } catch (e) {
    console.error('buy error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AXC 잔액 조회 (address는 Smart Account 주소 권장)
router.get('/balance', async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'address is required' });
    // DB 캐시 사용: 로그인 사용자 기준으로만 캐시
    let cached = null;
    try {
      const current = await getCurrentUser(req);
      if (current && current.user) {
        cached = await db.User.findByPk(current.user.id);
      }
    } catch {}
    const ttlMs = 60 * 1000;
    if (cached && cached.smart_account_address && cached.smart_account_address.toLowerCase() === address.toLowerCase() && cached.axc_balance_units != null && cached.balances_updated_at && (Date.now() - new Date(cached.balances_updated_at).getTime() < ttlMs)) {
      return res.json({ success: true, balance: Number(cached.axc_balance_units) / 1e6, balanceUnits: String(cached.axc_balance_units), cached: true });
    }
    const result = await contractManager.getAxcBalance(address);
    if (!result.success) return res.status(500).json({ error: result.error });
    if (cached) {
      await cached.update({ axc_balance_units: BigInt(result.balanceUnits), balances_updated_at: new Date() });
    }
    res.json({ success: true, balance: result.balance, balanceUnits: result.balanceUnits, cached: false });
  } catch (e) {
    console.error('balance error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 구글 EOA로 Smart Account 주소 반환(없으면 생성)
router.get('/smart-account', async (req, res) => {
  try {
    const { eoa } = req.query;
    if (!eoa) return res.status(400).json({ error: 'eoa is required' });
    const result = await contractManager.getOrCreateSmartAccount(eoa);
    if (!result.success) return res.status(500).json({ error: result.error });
    try {
      const current = await getCurrentUser(req);
      if (current && current.user) {
        const user = await db.User.findByPk(current.user.id);
        if (user) await user.update({ smart_account_address: result.smartAccount });
      }
    } catch {}
    res.json({ success: true, smartAccount: result.smartAccount });
  } catch (e) {
    console.error('smart-account error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 구글 EOA로 Smart Account 주소 예측(생성하지 않음)
router.get('/smart-account/predict', async (req, res) => {
  try {
    const { eoa } = req.query;
    if (!eoa) return res.status(400).json({ error: 'eoa is required' });
    const result = await contractManager.getPredictedSmartAccount(eoa);
    if (!result.success) return res.status(500).json({ error: result.error });
    try {
      const current = await getCurrentUser(req);
      if (current && current.user) {
        const user = await db.User.findByPk(current.user.id);
        if (user) await user.update({ smart_account_address: result.smartAccount });
      }
    } catch {}
    res.json({ success: true, smartAccount: result.smartAccount, deployed: result.deployed });
  } catch (e) {
    console.error('smart-account predict error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 토큰ID의 리스트 상태 조회
router.get('/listing/:tokenId', async (req, res) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const result = await contractManager.getListing(tokenId);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true, listing: result.listing });
  } catch (e) {
    console.error('listing error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 토큰ID의 NFT 소유자 조회
router.get('/nft-owner/:tokenId', async (req, res) => {
  try {
    const tokenId = Number(req.params.tokenId);
    const result = await contractManager.getNFTOwner(tokenId);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true, owner: result.owner });
  } catch (e) {
    console.error('nft-owner error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ETH 잔액 조회 (Deprecated: 사용 안 함)
router.get('/eth-balance', async (req, res) => {
  try {
    // 프론트 최적화로 더 이상 ETH 잔액을 사용하지 않음. 즉시 0 반환
    return res.json({ success: true, balance: 0, balanceWei: '0', deprecated: true });
  } catch (e) {
    res.json({ success: true, balance: 0, balance: 0, balanceWei: '0', deprecated: true });
  }
});

// 모든 활성 리스팅 가져오기
router.get('/listings', async (req, res) => {
  try {
    console.log('=== 모든 리스팅 조회 ===');
    const result = await contractManager.getAllListings();
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true, listings: result.listings });
  } catch (e) {
    console.error('listings error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NFT 구매
router.post('/buy', async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return res.status(401).json({ error: 'Authentication required' });

    const { tokenId, password } = req.body;
    if (tokenId === undefined) return res.status(400).json({ error: 'tokenId is required' });

    const userType = currentUser.loginType === 'google' ? 'google' : 'metamask';
    let signerOrSig = null;
    if (userType === 'google' && password) {
      const { createPasswordBasedWallet } = require('../utils/walletGenerator');
      signerOrSig = createPasswordBasedWallet(currentUser.user.google_id, password);
    } else if (userType === 'metamask' && req.body.signature) {
      signerOrSig = req.body.signature;
    }

    const rawAddress = userType === 'google'
      ? (currentUser.user.eoa_address || currentUser.user.wallet_address)
      : (currentUser.user.wallet_address || currentUser.user.eoa_address);
    let buyerAddress;
    try { buyerAddress = ethers.getAddress(String(rawAddress || '')); } catch { return res.status(400).json({ error: `invalid address: ${rawAddress}` }); }
    
    const result = await contractManager.buyNFT(buyerAddress, Number(tokenId), signerOrSig, userType);
    if (!result.success) return res.status(500).json({ error: result.error || 'Buy failed' });

    // 구매 완료 후 DB에 NFT 정보 저장
    try {
      console.log('=== 구매 완료 후 DB 저장 시작 ===');
      
      // 구매자의 Smart Account 주소 가져오기
      const buyerSmartAccount = await contractManager.getOrCreateSmartAccount(buyerAddress);
      if (!buyerSmartAccount.success) {
        console.error('구매자 Smart Account 조회 실패:', buyerSmartAccount.error);
      } else {
        console.log('구매자 Smart Account:', buyerSmartAccount.smartAccount);
        
        // NFT 메타데이터 가져오기 (간단한 정보)
        const nftData = {
          title: `NFT #${tokenId}`,
          description: '구매한 NFT',
          image_ipfs_uri: '🎨', // 기본 이미지
          status: 'minted',
          token_id: tokenId,
          contract_address: process.env.ARTWORK_NFT_ADDRESS,
          creator: buyerSmartAccount.smartAccount, // 구매자가 소유자
          owner_address: buyerSmartAccount.smartAccount,
          is_purchased: true,
          purchase_date: new Date(),
          purchase_transaction_hash: result.transactionHash
        };
        
        console.log('저장할 NFT 데이터:', nftData);
        
        // DB에 저장
        const newNFT = await db.Artwork.create(nftData);
        console.log('NFT DB 저장 완료:', newNFT.id);
        
        // 구매자 정보 업데이트
        if (currentUser && currentUser.user) {
          await currentUser.user.update({ 
            smart_account_address: buyerSmartAccount.smartAccount 
          });
          console.log('구매자 Smart Account 주소 업데이트 완료');
        }
      }
    } catch (dbError) {
      console.error('DB 저장 실패:', dbError);
      // DB 저장 실패해도 구매는 성공했으므로 계속 진행
    }

    res.json({ success: true, transactionHash: result.transactionHash });
  } catch (e) {
    console.error('buy error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 