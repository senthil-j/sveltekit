const primeLevel = 'noPrime';
export function reAssignPriceValues(res) {
	if (res.length) {
		res.forEach((currentHit, currentHitIndex) => {
			if (currentHit?.price) {
				currentHit.price = updatePrice(currentHit?.price, 'price', res, currentHitIndex);
			}

			if (currentHit?.priceValueTasheel) {
				currentHit.priceValueTasheel = updatePrice(
					currentHit?.priceValueTasheel,
					'priceValueTasheel',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.priceValueDiscount) {
				currentHit.priceValueDiscount = updatePrice(
					currentHit?.priceValueDiscount,
					'priceValueDiscount',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.priceValueDiscountPercentage) {
				currentHit.priceValueDiscountPercentage = updatePrice(
					currentHit?.priceValueDiscountPercentage,
					'priceValueDiscountPercentage',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.wasTasheelPrice) {
				currentHit.wasTasheelPrice = updatePrice(
					currentHit?.wasTasheelPrice,
					'wasTasheelPrice',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.tacticalBasicPrimePrice) {
				currentHit.tacticalBasicPrimePrice = updatePrice(
					currentHit?.tacticalBasicPrimePrice,
					'tacticalBasicPrimePrice',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.tacticalVipPrimePrice) {
				currentHit.tacticalVipPrimePrice = updatePrice(
					currentHit?.tacticalVipPrimePrice,
					'tacticalVipPrimePrice',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.basicPrimePrice) {
				currentHit.basicPrimePrice = updatePrice(
					currentHit?.basicPrimePrice,
					'basicPrimePrice',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.vipPrimePrice) {
				currentHit.vipPrimePrice = updatePrice(
					currentHit?.vipPrimePrice,
					'vipPrimePrice',
					res,
					currentHitIndex
				);
			}

			if (currentHit?.cashback) {
				currentHit.cashback = updatePrice(currentHit?.cashback, 'cashback', res, currentHitIndex);
			}
		});
		return res;
	}
}

function updatePrice(price, type, res, currentHitIndex) {
	let priceMapper = {
		price: 'price',
		priceValueTasheel: 'priceValueTasheel',
		priceValueDiscount: 'priceValueDiscount',
		priceValueDiscountPercentage: 'priceValueDiscountPercentage',
		wasTasheelPrice: 'wasTasheelPrice',
		tacticalBasicPrimePrice: 'tacticalBasicPrimePrice',
		tacticalVipPrimePrice: 'tacticalVipPrimePrice',
		basicPrimePrice: 'basicPrimePrice',
		vipPrimePrice: 'vipPrimePrice',
		cashback: 'cashback'
	};
	if (primeLevel === 'VIPPRIME') {
		priceMapper = {
			price: 'productVIPPrimeDiscountPrice',
			priceValueTasheel: 'vipPrimePriceValueTasheel',
			priceValueDiscount: 'vipPriceValueDiscount',
			priceValueDiscountPercentage: 'vipPrimepriceDiscountPercentage',
			wasTasheelPrice: 'vipPrimePriceValueTasheel',
			tacticalBasicPrimePrice: 'tacticalBasicPrimePrice',
			tacticalVipPrimePrice: 'tacticalSimplePromoVipPrimePrice',
			basicPrimePrice: 'basicPrimePrice',
			vipPrimePrice: 'simplePromoVipPrimePrice',
			cashback: 'vipPrimeCashback'
		};
	} else if (primeLevel === 'BASICPRIME') {
		priceMapper = {
			price: 'productBasicPrimeDiscountPrice',
			priceValueTasheel: 'basicPrimePriceValueTasheel',
			priceValueDiscount: 'basicPriceValueDiscount',
			priceValueDiscountPercentage: 'basicPrimepriceDiscountPercentage',
			wasTasheelPrice: 'basicPrimePriceValueTasheel',
			tacticalBasicPrimePrice: 'tacticalSimplePromoBasicPrimePrice',
			tacticalVipPrimePrice: 'tacticalSimplePromoVipPrimePriceForBlueUser',
			basicPrimePrice: 'simplePromoBasicPrimePrice',
			vipPrimePrice: 'simplePromoVipPrimePriceForBlueUser',
			cashback: 'basicPrimeCashback'
		};
	}
	if (
		price &&
		typeof type != 'undefined' &&
		typeof res[currentHitIndex] != 'undefined' &&
		typeof priceMapper[type] != 'undefined' &&
		typeof res[currentHitIndex][priceMapper[type]] != 'undefined' &&
		res[currentHitIndex][priceMapper[type]] > 0
	) {
		console.log(
			price,
			type,
			priceMapper[type],
			res[currentHitIndex].productCode,
			res[currentHitIndex][priceMapper[type]],
			'reassign price',
			res[currentHitIndex]
		);
		return res[currentHitIndex][priceMapper[type]];
	}
	return price;
}
