import { GetProfile } from "@/api/profile";
import GetCookie from '@/hooks/cookies/getCookie';
import { GetrecentFlickers } from "@/api/recent-flickers";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { FC, useState, useEffect } from "react";
import Modal from "../modal/modal";
import RecentFlickersTable from "../recent-flickers-table/recentFlickerTable";
import BadgeModal from "../badge-modal/badge-modal";
import { create } from "domain";

interface ProfileModalProps {
	show: boolean;
  handleModal: () => void;
}

const RecentTable = () => {
	const {data} = useQuery({
    queryKey: ['recent'],
    queryFn: async () => await GetrecentFlickers(null)
  })
	return (
		<RecentFlickersTable classname="auto" tableData={data} />
	);
}

const ProfileModal:FC<ProfileModalProps> = ({ show, handleModal }) => {
	const[pubKey, setPubkey] = useState('');
	const[createDate, setCreateDate] = useState('');
	const[showBadgeModal, setShowBadgeModal] = useState(false);
	const[showBadge, setShowBadge] = useState('');

	const badges_array = [
		"first_flip",
		"high_roller",
		"hot_streak",
		"intermediate_streak",
		"beginner_streak",
		"blank_badge",
		"blank_badge",
		"blank_badge",
		"blank_badge",
	]

	const {data, isLoading, error, isError} = useQuery({
		queryKey: ['profile'],
		queryFn:  GetProfile
	});
	
	const {data: recentData} = useQuery({
		queryKey: ['recent'],
		queryFn: async () => await GetrecentFlickers(null)
	  })

	if(isError) {
		enqueueSnackbar("Server Error", {variant: 'error', anchorOrigin: {horizontal: 'left', vertical: 'top'}})
	}

	const handleBadgeModal = (badge) => {
		setShowBadgeModal(!showBadgeModal);
		setShowBadge(badge);
	}

	const copyReferralLink = () => {
		navigator.clipboard.writeText(window.location.origin+`?ref=${data?.data.data.referrals.referral_code}`)
		enqueueSnackbar('Copied', {variant: 'success', anchorOrigin: {horizontal: 'left', vertical: 'top'}})
	}

	useEffect(() => {
		console.log('@@@', data);
		const key = GetCookie('publicKey');
    	setPubkey(`${key.slice(0, 5)}....${key.slice(-8)}`);
		
		const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		const stringDate = months[(new Date(data?.data.data.accountCreation)).getMonth()] + " " + (new Date(data?.data.data.accountCreation)).getFullYear()
		setCreateDate(stringDate)
	}, [data])

  return(
		<Modal customClass={'profile-modal'} show={show} handleModal={handleModal}>
			<div className="profile">
				<div className="profile-header">
					<div className="profile-header-left">
						<img src={"/static/img/avatar.png"} />
						<div>
							<span>
								{data?.data.data.userName}
							</span>
							<span>
								{data?.data.data.publicKey.slice(0, 5)}....{data?.data.data.publicKey.slice(-8)}
							</span>
							<span>
								Flipping since <a>{createDate}</a>
							</span>
						</div>
					</div>
					<div className="profile-header-right">
						<div>
							<span>
								Current rank
							</span>
							<span>
								{data?.data.data.leaderboard.current}
							</span>
						</div>
						<div>
							<span>
								Highest
							</span>
							<span>
								{data?.data.data.leaderboard.best}
							</span>
						</div>
					</div>
				</div>
				<div className="profile-value">
					<div className="profile-value-item">
						<span>
							Success in a row
						</span>
						<span style={{
							color: '#5BEF43'
						}}>
							{data?.data.data.streaks.success}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							Fails in a row
						</span>
						<span style={{
							color: '#EF4343'
						}}>
							{data?.data.data.streaks.failure}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							XP points
						</span>
						<span style={{
							color: '#FDCD00'
						}}>
							{data?.data.data.points}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							Number of games
						</span>
						<span>
							{data?.data.data.gamesPlayed}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							Total amount bet
						</span>
						<span>
							{Math.round((parseFloat(data?.data.data.insights.totalAmountBet) + Number.EPSILON) * 100) / 100}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							Winning percentage
						</span>
						<span>
							{data?.data.data.insights.winningPercentage}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							Total earnings
						</span>
						<span>
							{Math.round((parseFloat(data?.data.data.insights.totalEarnings) + Number.EPSILON) * 100) / 100}
						</span>
					</div>
					<div className="profile-value-item">
						<span>
							Avg. bet amount
						</span>
						<span>
							{Math.round((parseFloat(data?.data.data.insights.averageBetAmount) + Number.EPSILON) * 100) / 100}
						</span>
					</div>
					
				</div>
				<div className="profile-other">
					<div className="history">
						<div className="title">
							Flip history
						</div>
						<div className="content">
							<ul className={`primary-list`}>
								<li className="primary-list__header">
									{/* <div className="primary-list__header__col">Most recent been flickers</div>
									<div className="primary-list__header__col-2">See all</div> */}
								</li>
								<li>
									<ul >
									{
										// @ts-ignore
									recentData ? recentData.map((item, index) => (
										<li className="primary-list__item" key={index}>
										{/* <div className="primary-list__col">{item?.public_key.slice(0, 5)}...{item?.public_key.slice(-5)}</div> */}
										<div className="primary-list__col-2">flipped <span>{Math.round((parseFloat(item.bet_amount) + Number.EPSILON) * 100) / 100} ACD3</span> and <span style={{color: item.outcome == 'lost' ? '#EF4343' : '#5BEF43'}}>{item.outcome}</span></div>
										<div className="primary-list__col-3">{item.timeAgo}</div>
										</li>
									)) : <p style={{ textAlign: 'center', marginTop: 50 }}>Loading Data</p>
									}  
									</ul>  
								</li>
								
								<div>
								</div>
							</ul>
						</div>
					</div>
					<div className="referrals">
						<div className="title">
							Referrals
						</div>
						<div className="content">
							<div className="code">
								<div>
									<span>
										Referral code
									</span>
									<span>
										{data?.data.data.referrals.referral_code}
									</span>
								</div>
								<img 
									src="/static/svgs/copy.svg" 
									onClick={copyReferralLink}
								/>
							</div>
							<div className="statistics">
								<div className="user_number">
									<span>
										Number <br /> of users <br /> referred
									</span>
									<span>
										{data?.data.data.referrals.total_number_of_users_referred}
									</span>
								</div>
								<div className="total_earned">
									<span>
										Total <br /> earned
									</span>
									<span>
										{data?.data.data.referrals.total_earned_through_referrals}
									</span>
								</div>
							</div>
						</div>
					</div>
					<div className="badges">
						<div className="title">
							Badges
						</div>
						<div className="content">
							{
								badges_array.map(item => <div className="item" onClick={() => handleBadgeModal(item)}>
									<img src={`/static/svgs/${item}.svg`} className={`${item === 'blank_badge' && 'blank'}`}/>
								</div>)
							}
						</div>
					</div>
				</div>
			</div>
			<BadgeModal 
				show={showBadgeModal}
				handleModal={() => handleBadgeModal('')}
				badge={showBadge}
			/>
		</Modal>
  )
}

export default ProfileModal;