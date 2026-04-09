from datetime import date, timedelta


def update_card_sm2(ease_factor: float, interval: int, repetitions: int, quality_rating: int) -> dict:
    """
    SM-2 Spaced Repetition Algorithm.

    Args:
        ease_factor: Current ease factor (starts at 2.5)
        interval: Current interval in days
        repetitions: Number of successful reviews
        quality_rating: 0-5 (0=blackout, 3=correct with difficulty, 5=perfect)

    Returns:
        Dict with new ease_factor, interval, repetitions, next_review_date
    """
    # Calculate new ease factor
    new_ease_factor = max(
        1.3,
        ease_factor + (0.1 - (5 - quality_rating) * (0.08 + (5 - quality_rating) * 0.02))
    )

    # Calculate new interval and repetitions
    if quality_rating < 3:
        # User failed — reset
        new_repetitions = 0
        new_interval = 1
    else:
        # User passed
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 3
        else:
            new_interval = round(interval * new_ease_factor)

        new_repetitions = repetitions + 1

    next_review_date = date.today() + timedelta(days=new_interval)

    return {
        "ease_factor": round(new_ease_factor, 4),
        "interval": new_interval,
        "repetitions": new_repetitions,
        "next_review_date": next_review_date,
    }
