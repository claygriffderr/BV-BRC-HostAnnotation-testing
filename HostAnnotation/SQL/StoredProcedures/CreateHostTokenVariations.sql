

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- ==========================================================================================================
-- Author: don dempsey
-- Created on: 02/23/23
-- Description: 
-- Updated: 02/22/24 dmd: Changed name from evaluateHostTokenVariations
-- ==========================================================================================================

-- Delete any existing versions.
IF OBJECT_ID('dbo.createHostTokenVariations') IS NOT NULL
	DROP PROCEDURE dbo.createHostTokenVariations
GO

CREATE PROCEDURE dbo.createHostTokenVariations

	-- add_s_to_end
	@addSToEnd AS NVARCHAR(300),

	-- append_spdot
	@appendSpDot AS NVARCHAR(300),

	-- The base token
	@baseToken AS NVARCHAR(300),

	-- The base token's type
	@baseType AS NVARCHAR(100),

	-- The host ID
	@hostID AS INT,

	-- Was the host text split into multiple host tokens?
	@isOneOfMany AS BIT,

	-- minus_one_word_left
	@minusOneWordLeft AS NVARCHAR(300),

	-- minus_one_word
	@minusOneWordRight AS NVARCHAR(300),

	-- minus_two_words_left
	@minusTwoWordsLeft AS NVARCHAR(300),

	-- minus_two_words
	@minusTwoWordsRight AS NVARCHAR(300),

	-- minus_three_words_left
	@minusThreeWordsLeft AS NVARCHAR(300),

	-- minus_three_words
	@minusThreeWordsRight AS NVARCHAR(300),

	-- prepend_common
	@prependCommon AS NVARCHAR(300),

	-- remove_common_append_spdot
	@removeCommonAppendSpDot AS NVARCHAR(300),

	-- remove_common_from_start
	@removeCommonFromStart AS NVARCHAR(300),

	-- remove_s_append_spdot
	@removeSAppendSpDot AS NVARCHAR(300),

	-- remove_s_from_end
	@removeSFromEnd AS NVARCHAR(300),

	-- remove_spdot_from_end
	@removeSpDotFromEnd AS NVARCHAR(300)


AS
BEGIN
	SET XACT_ABORT, NOCOUNT ON

	-- A constant error code to use when throwing exceptions.
	DECLARE @errorCode AS INT = 50000

	BEGIN TRY

		DECLARE @baseTokenID AS INT = NULL


	/*
	An example call:
	
	EXEC dbo.evaluateHostTokenVariations 
	@addSToEnd = 'chickens', 
	@appendSpDot = 'chicken sp.', 
	@baseToken = 'chicken', 
	@baseType = 'stop_words_removed', 
	@hostID = 12345, 
	@minusOneWordLeft = NULL, 
	@minusOneWordRight = NULL, 
	@minusTwoWordsLeft = NULL, 
	@minusTwoWordsRight = NULL, 
	@minusThreeWordsLeft = NULL, 
	@minusThreeWordsRight = NULL, 
	@prependCommon = 'common chicken', 
	@removeCommonAppendSpDot = NULL, 
	@removeCommonFromStart = NULL, 
	@removeSAppendSpDot = NULL, 
	@removeSFromEnd = NULL, 
	@removeSpDotFromEnd = NULL 
	*/

		DECLARE @tempTokenID AS INT = NULL


		-- Map the base token to the host and get its host token ID.
		EXEC dbo.mapHostTokenToHost
			@baseTokenID = NULL,
			@filteredText = @baseToken,
			@isOneOfMany = @isOneOfMany,
			@hostID = @hostID,
			@hostTokenID = @baseTokenID OUTPUT,
			@relationType = @baseType

	
		-- add_s_to_end
		IF @addSToEnd IS NOT NULL AND LEN(@addSToEnd) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @addSToEnd,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'add_s_to_end'
		END

		-- append_spdot
		IF @appendSpDot IS NOT NULL AND LEN(@appendSpDot) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @appendSpDot,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'append_spdot'
		END

		-- minus_one_word_left
		IF @minusOneWordLeft IS NOT NULL AND LEN(@minusOneWordLeft) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @minusOneWordLeft,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'minus_one_word_left'
		END

		-- minus_one_word
		IF @minusOneWordRight IS NOT NULL AND LEN(@minusOneWordRight) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @minusOneWordRight,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'minus_one_word'
		END

		-- minus_two_words_left
		IF @minusTwoWordsLeft IS NOT NULL AND LEN(@minusTwoWordsLeft) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @minusTwoWordsLeft,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'minus_two_words_left'
		END

		-- minus_two_words
		IF @minusTwoWordsRight IS NOT NULL AND LEN(@minusTwoWordsRight) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @minusTwoWordsRight,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'minus_two_words'
		END

		-- minus_three_words_left
		IF @minusThreeWordsLeft IS NOT NULL AND LEN(@minusThreeWordsLeft) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @minusThreeWordsLeft,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'minus_three_words_left'
		END

		-- minus_three_words
		IF @minusThreeWordsRight IS NOT NULL AND LEN(@minusThreeWordsRight) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @minusThreeWordsRight,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'minus_three_words'
		END

		-- prepend_common
		IF @prependCommon IS NOT NULL AND LEN(@prependCommon) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @prependCommon,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'prepend_common'
		END

		-- remove_common_append_spdot
		IF @removeCommonAppendSpDot IS NOT NULL AND LEN(@removeCommonAppendSpDot) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @removeCommonAppendSpDot,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'remove_common_append_spdot'
		END

		-- remove_common_from_start
		IF @removeCommonFromStart IS NOT NULL AND LEN(@removeCommonFromStart) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @removeCommonFromStart,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'remove_common_from_start'
		END

		-- remove_s_append_spdot
		IF @removeSAppendSpDot IS NOT NULL AND LEN(@removeSAppendSpDot) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @removeSAppendSpDot,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'remove_s_append_spdot'
		END

		-- remove_s_from_end
		IF @removeSFromEnd IS NOT NULL AND LEN(@removeSFromEnd) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @removeSFromEnd,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'remove_s_from_end'
		END

		-- remove_spdot_from_end
		IF @removeSpDotFromEnd IS NOT NULL AND LEN(@removeSpDotFromEnd) > 0
		BEGIN
			EXEC dbo.mapHostTokenToHost
				@baseTokenID = @baseTokenID,
				@filteredText = @removeSpDotFromEnd,
				@isOneOfMany = @isOneOfMany,
				@hostID = @hostID,
				@hostTokenID = @tempTokenID,
				@relationType = 'remove_spdot_from_end'
		END

	END TRY
	BEGIN CATCH
		DECLARE @errorMsg AS VARCHAR(200) = ERROR_MESSAGE()
		RAISERROR(@errorMsg, 18, 1)
	END CATCH 
END